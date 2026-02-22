const pool = require("../config/db");
const referralService = require("./referral.service");

exports.bookSeat = async(userId, packageName, incomeType) => { // 👈 Added incomeType
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Get package details
        const packageRes = await client.query(
            "SELECT * FROM packages WHERE name = $1", [packageName.toUpperCase()]
        );

        if (packageRes.rows.length === 0) {
            throw new Error("Invalid package selected");
        }

        const pkg = packageRes.rows[0];
        const ticketPrice = Number(pkg.ticket_price);
        const BATCH_SIZE = pkg.total_seats || 180; // 👈 Needed for batch calculation

        // 2️⃣ CHECK WALLET BALANCE (Locking Row with NULL protection)
        const walletRes = await client.query(
            "SELECT COALESCE(balance, 0) as balance FROM wallets WHERE user_id = $1 FOR UPDATE", [userId]
        );

        if (walletRes.rows.length === 0) {
            throw new Error("Wallet not found");
        }

        const currentBalance = Number(walletRes.rows[0].balance);

        if (currentBalance < ticketPrice) {
            throw new Error(`Insufficient balance. Need $${ticketPrice}, Have $${currentBalance}`);
        }

        // 3️⃣ DEDUCT MONEY 💸
        await client.query(
            "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2", [ticketPrice, userId]
        );

        // 4️⃣ Find next available seat
        const seatRes = await client.query(
            `SELECT * FROM seats
             WHERE package_id = $1 AND status = 'AVAILABLE'
             ORDER BY seat_number ASC
             LIMIT 1
             FOR UPDATE`, [pkg.id]
        );

        if (seatRes.rows.length === 0) {
            throw new Error("No seats available for this package");
        }

        const seat = seatRes.rows[0];

        // 5️⃣ Calculate Batch Number (Critical for income.service.js)
        const countRes = await client.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'OCCUPIED'", [pkg.id]
        );
        const totalOccupied = parseInt(countRes.rows[0].count);

        // ⚠️ Numeric Safety for Batch Size
        const batchSize = Number(pkg.total_seats) || 180;
        const currentBatch = Math.floor(totalOccupied / batchSize) + 1;

        // 6️⃣ Assign seat (Fixed status and added forced numeric income data)
        // Ensure values are numbers to prevent "0.00" database errors
        const dIncome = Number(pkg.daily_income) || 0;
        const mIncome = Number(pkg.monthly_income) || 0;
        const yIncome = Number(pkg.yearly_income) || 0;

        await client.query(
            `UPDATE seats
             SET user_id = $1,
                 status = 'OCCUPIED', 
                 booked_at = NOW(),
                 income_type = $3,
                 batch_number = $4,
                 daily_income = $5,
                 monthly_income = $6,
                 yearly_income = $7
             WHERE id = $2`, [
                userId,
                seat.id,
                incomeType || 'DAILY',
                currentBatch,
                dIncome, // 🟢 Forced numeric value
                mIncome, // 🟢 Forced numeric value
                yIncome // 🟢 Forced numeric value
            ]
        );

        // 7️⃣ COMMIT TRANSACTION
        await client.query("COMMIT");

        // 8️⃣ REFERRAL LOGIC
        try {
            console.log("🔄 Processing Referrals...");
            await referralService.processDepthReferral(userId, ticketPrice);
            await referralService.processWidthReferral(userId);
            console.log("✅ Referral Bonus Processed");
        } catch (refError) {
            console.error("⚠️ Referral Warning:", refError.message);
        }

        return {
            package: pkg.name,
            seatNumber: seat.seat_number,
            batchNumber: currentBatch,
            ticketPrice: ticketPrice,
            remainingBalance: currentBalance - ticketPrice
        };

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Booking Transaction Failed:", error.message);
        throw error;
    } finally {
        client.release();
    }
};