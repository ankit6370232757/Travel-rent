const pool = require("../config/db");
const referralService = require("../services/referral.service");

// ✅ BOOK SEAT (Fully Functional)
exports.bookSeat = async(req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { packageName, incomeType } = req.body;

        // 1. Validation
        if (!packageName) {
            return res.status(400).json({ message: "Package name is required" });
        }

        const validTypes = ["DAILY", "MONTHLY", "YEARLY"];
        if (!incomeType || !validTypes.includes(incomeType)) {
            return res.status(400).json({ message: "Invalid Income Plan selected" });
        }

        await client.query("BEGIN");

        // 2. Get Package Details
        const pkgRes = await client.query("SELECT * FROM packages WHERE name = $1", [packageName]);
        if (pkgRes.rows.length === 0) {
            throw new Error("Package not found");
        }

        const pkg = pkgRes.rows[0];
        const BATCH_SIZE = pkg.total_seats || 180;
        const price = parseFloat(pkg.ticket_price);

        // 3. Check User Wallet Balance
        const walletRes = await client.query("SELECT balance FROM wallets WHERE user_id = $1", [userId]);
        const userBalance = parseFloat((walletRes.rows[0] && walletRes.rows[0].balance) || 0);

        if (userBalance < price) {
            throw new Error(`Insufficient Balance. Required: $${price}, Available: $${userBalance}`);
        }

        // 4. Calculate Batch & Seat Number
        const countRes = await client.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'OCCUPIED'", [pkg.id]
        );
        const totalSold = parseInt(countRes.rows[0].count);

        const currentBatch = Math.floor(totalSold / BATCH_SIZE) + 1;
        const seatInBatch = (totalSold % BATCH_SIZE) + 1;

        // 5. Calculate OTS (Instant Bonus)
        const otsBonus = (price * 0.06) / seatInBatch;

        // 6. Deduct Ticket Price from Wallet
        await client.query(
            "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2", [price, userId]
        );
        // Updated to include income values from the package
        // 7. Create Seat Record & CAPTURE THE ID 🚀
        // 7. Create Seat Record & CAPTURE THE ID 🚀
        const seatInsertRes = await client.query(
            `INSERT INTO seats (
        user_id,          -- $1
        package_id,       -- $2
        seat_number,      -- $3
        batch_number,     -- $4
        status,           
        booked_at,        
        ots_income,       -- $5
        income_type,      -- $6
        daily_income,     -- $7
        monthly_income,   -- $8
        yearly_income,    -- $9
        last_payout,      
        days_remaining    
    ) VALUES (
        $1, $2, $3, $4, 'OCCUPIED', NOW(), $5, $6, $7, $8, $9, NOW(), 365
    ) 
    RETURNING id`, [
                userId, // $1
                pkg.id, // $2
                seatInBatch, // $3
                currentBatch, // $4
                otsBonus, // $5
                incomeType, // $6
                pkg.daily_income, // $7
                pkg.monthly_income, // $8
                pkg.yearly_income // $9
            ]
        );

        const seatId = seatInsertRes.rows[0].id;
        // 8. PAY INSTANT BONUS (Credit to Wallet)
        if (otsBonus > 0) {
            await client.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [otsBonus, userId]
            );

            // Log OTS Income
            await client.query(
                "INSERT INTO income_logs (user_id, amount, income_type, seat_id, created_at) VALUES ($1, $2, 'OTS_BONUS', $3, NOW())", [userId, otsBonus, seatId]
            );
        }

        // 9. Process Referral Bonuses (Using the new seatId) 🚀
        await referralService.processReferralBonuses(userId, price, seatId, pkg.id);

        await client.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Seat booked successfully! ✅",
            data: {
                package: pkg.name,
                plan: incomeType,
                batch: currentBatch,
                seat: seatInBatch,
                bonus: otsBonus.toFixed(4)
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("BOOK SEAT ERROR 👉", error.message);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

// ✅ Get All Bookings for Admin (Updated to show Income Type)
exports.getAllBookings = async(req, res) => {
    try {
        const query = `
            SELECT 
                s.seat_number, 
                s.batch_number,
                s.booked_at, 
                s.income_type,
                p.name as package_name, 
                p.ticket_price, -- Aliased for frontend consistency
                u.id as user_id,        -- 👈 CRITICAL: Added this to fix #N/A
                u.email,
                u.name as user_name
            FROM seats s
            JOIN packages p ON s.package_id = p.id
            JOIN users u ON s.user_id = u.id
            WHERE s.status = 'OCCUPIED'
            ORDER BY s.booked_at DESC
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Bookings Error:", err);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};