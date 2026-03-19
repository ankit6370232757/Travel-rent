const pool = require("../config/db");
const referralService = require("../services/referral.service");

// ✅ BOOK SEAT (Fully Functional - Managed via Seats Table)
exports.bookSeat = async(req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        let { packageName, incomeType } = req.body;

        // 1. Validation
        if (!packageName || !incomeType) {
            return res.status(400).json({ message: "Package name and Income Plan are required" });
        }

        await client.query("BEGIN");

        // 2. Get Package Details (Using UPPER to match DB standards)
        const pkgRes = await client.query(
            "SELECT * FROM packages WHERE UPPER(name) = $1", [packageName.toUpperCase()]
        );

        if (pkgRes.rows.length === 0) {
            throw new Error("Package not found");
        }

        const pkg = pkgRes.rows[0];
        const BATCH_SIZE = pkg.total_seats || 180;
        const price = parseFloat(pkg.ticket_price);

        // 3. Check & Lock User Wallet Balance
        // 'FOR UPDATE' prevents race conditions if multiple requests hit at once
        const walletRes = await client.query(
            "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE", [userId]
        );
        const userBalance = parseFloat((walletRes.rows[0] && walletRes.rows[0].balance) || 0);

        if (userBalance < price) {
            throw new Error(`Insufficient Balance. Required: $${price}, Available: $${userBalance}`);
        }

        // 4. Calculate Current Batch & Seat Number based on existing OCCUPIED seats
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

        // 7. Create Seat Record & Capture the ID
        const seatInsertRes = await client.query(
            `INSERT INTO seats (
                user_id, package_id, seat_number, batch_number, status, 
                booked_at, ots_income, income_type, 
                daily_income, monthly_income, yearly_income, 
                last_payout, days_remaining
            ) VALUES ($1, $2, $3, $4, 'OCCUPIED', NOW(), $5, $6, $7, $8, $9, NOW(), 365) 
            RETURNING id`, [
                userId, pkg.id, seatInBatch, currentBatch,
                otsBonus, incomeType, pkg.daily_income,
                pkg.monthly_income, pkg.yearly_income
            ]
        );

        const seatId = seatInsertRes.rows[0].id;

        // 8. PAY INSTANT OTS BONUS (If applicable)
        if (otsBonus > 0) {
            await client.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [otsBonus, userId]
            );

            await client.query(
                `INSERT INTO income_logs (user_id, amount, income_type, seat_id, created_at) 
                 VALUES ($1, $2, 'OTS_BONUS', $3, NOW())`, [userId, otsBonus, seatId]
            );
        }

        // 9. Process Referral Bonuses 🚀
        // This function now internally queries the 'seats' table for width counting
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

// ✅ Get All Bookings for Admin
exports.getAllBookings = async(req, res) => {
    try {
        const query = `
            SELECT 
                s.seat_number, 
                s.batch_number,
                s.booked_at, 
                s.income_type,
                p.name as package_name, 
                p.ticket_price,
                u.id as user_id,
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
exports.getUserActivePackages = async(req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                s.id as seat_id,
                p.name as package_name,
                p.ticket_price,
                s.seat_number,
                s.batch_number,
                s.booked_at,
                s.income_type,
                s.daily_income,
                s.days_remaining
            FROM seats s
            JOIN packages p ON s.package_id = p.id
            WHERE s.user_id = $1 AND s.status = 'OCCUPIED'
            ORDER BY s.booked_at DESC
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching active assets" });
    }
};