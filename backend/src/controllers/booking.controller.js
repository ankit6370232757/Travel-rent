const pool = require("../config/db");

// ✅ BOOK SEAT (Updated for Income Plan Selection)
exports.bookSeat = async(req, res) => {
    const client = await pool.connect(); // Use a client for transactions
    try {
        const userId = req.user.id;
        // 🚀 RECEIVE 'incomeType' FROM FRONTEND
        const { packageName, incomeType } = req.body;

        if (!packageName) {
            return res.status(400).json({ message: "Package name is required" });
        }

        // 🛡️ Validate Income Type
        const validTypes = ["DAILY", "MONTHLY", "YEARLY"];
        if (!incomeType || !validTypes.includes(incomeType)) {
            return res.status(400).json({ message: "Invalid Income Plan selected" });
        }

        await client.query("BEGIN"); // Start Transaction

        // 1. Get Package Details
        const pkgRes = await client.query("SELECT * FROM packages WHERE name = $1", [packageName]);

        if (pkgRes.rows.length === 0) {
            throw new Error("Package not found");
        }

        const pkg = pkgRes.rows[0];
        const BATCH_SIZE = pkg.total_seats || 180;
        const price = parseFloat(pkg.ticket_price);

        // 2. Check User Wallet Balance
        const walletRes = await client.query("SELECT balance FROM wallets WHERE user_id = $1", [userId]);
        const userBalance = parseFloat((walletRes.rows[0] && walletRes.rows[0].balance) || 0);

        if (userBalance < price) {
            throw new Error(`Insufficient Balance. Required: $${price}, Available: $${userBalance}`);
        }

        // 3. Calculate Batch & Seat Number
        const countRes = await client.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'OCCUPIED'", [pkg.id]
        );
        const totalSold = parseInt(countRes.rows[0].count);

        const currentBatch = Math.floor(totalSold / BATCH_SIZE) + 1;
        const seatInBatch = (totalSold % BATCH_SIZE) + 1;

        // 4. Calculate OTS (Instant Bonus)
        const sixPercent = price * 0.06;
        const otsBonus = sixPercent / seatInBatch;

        // 5. Deduct Ticket Price from Wallet
        await client.query(
            "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2", [price, userId]
        );

        // 6. Create Seat Record (🚀 SAVING INCOME TYPE)
        // Make sure your 'seats' table has an 'income_type' column!
        // If not, run: ALTER TABLE seats ADD COLUMN income_type VARCHAR(20) DEFAULT 'DAILY';
        await client.query(
            `INSERT INTO seats (
                user_id, package_id, seat_number, batch_number, status, 
                booked_at, ots_income, income_type
            ) VALUES ($1, $2, $3, $4, 'OCCUPIED', NOW(), $5, $6) RETURNING id`, [userId, pkg.id, seatInBatch, currentBatch, otsBonus, incomeType]
        );

        // // 7. Record Investment as a Withdrawal (History)
        // await client.query(
        //     `INSERT INTO withdrawals (user_id, amount, fee, net_amount, status, created_at) 
        //      VALUES ($1, $2, 0, $2, 'APPROVED', NOW())`, [userId, price]
        // );

        // 8. PAY INSTANT BONUS (Credit to Wallet)
        if (otsBonus > 0) {
            await client.query(
                "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [otsBonus, userId]
            );

            // Log Income
            await client.query(
                "INSERT INTO income_logs (user_id, amount, income_type, created_at) VALUES ($1, $2, 'OTS_BONUS', NOW())", [userId, otsBonus]
            );
        }

        await client.query("COMMIT"); // Save Changes

        res.status(200).json({
            message: "Seat booked successfully ✅",
            data: {
                package: pkg.name,
                plan: incomeType, // Send back selected plan
                batch: currentBatch,
                seat: seatInBatch,
                bonus: otsBonus.toFixed(4),
                price: price
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
                s.income_type,  -- 👈 Fetch Plan Type
                p.name as package_name, 
                p.ticket_price, 
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
        console.error(err);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};