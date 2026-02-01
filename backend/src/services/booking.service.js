const pool = require("../config/db");
const referralService = require("./referral.service");

exports.bookSeat = async(userId, packageName) => {
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

        // 2️⃣ CHECK WALLET BALANCE (Crucial Step Added) 💰
        const walletRes = await client.query(
            "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE", [userId]
        );

        if (walletRes.rows.length === 0) {
            throw new Error("Wallet not found");
        }

        const currentBalance = Number(walletRes.rows[0].balance);

        if (currentBalance < ticketPrice) {
            throw new Error(`Insufficient balance. Required: $${ticketPrice}, Available: $${currentBalance}`);
        }

        // 3️⃣ DEDUCT MONEY 💸
        await client.query(
            "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2", [ticketPrice, userId]
        );

        // 4️⃣ Find next available seat (LOCKED)
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

        // 5️⃣ Assign seat
        await client.query(
            `UPDATE seats
             SET user_id = $1,
                 status = 'BOOKED',
                 booked_at = NOW()
             WHERE id = $2`, [userId, seat.id]
        );

        // 6️⃣ REFERRAL LOGIC (DEPTH + WIDTH)
        // Note: referralService must use the SAME client if possible to be part of transaction, 
        // but since your referral service uses 'pool', we keep it separate here.
        // If referral fails, we don't necessarily want to rollback the booking, 
        // but ideally, they should be connected. For now, this is safe.
        try {
            await referralService.processDepthReferral(userId, ticketPrice);
            await referralService.processWidthReferral(userId);
        } catch (refError) {
            console.error("Referral Error (Non-blocking):", refError.message);
        }

        // 7️⃣ Commit everything
        await client.query("COMMIT");

        return {
            package: pkg.name,
            seatNumber: seat.seat_number,
            ticketPrice: ticketPrice,
            remainingBalance: currentBalance - ticketPrice
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};