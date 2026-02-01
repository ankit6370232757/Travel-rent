const pool = require("../config/db");
const referralService = require("./referral.service"); // ✅ ADD THIS

exports.bookSeat = async(userId, packageName) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Get package
        const packageRes = await client.query(
            "SELECT * FROM packages WHERE name = $1", [packageName.toUpperCase()]
        );

        if (packageRes.rows.length === 0) {
            throw new Error("Invalid package selected");
        }

        const pkg = packageRes.rows[0];

        // 2️⃣ Find next available seat (LOCKED)
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

        // 3️⃣ Assign seat
        await client.query(
            `UPDATE seats
       SET user_id = $1,
           status = 'BOOKED',
           booked_at = NOW()
       WHERE id = $2`, [userId, seat.id]
        );

        // 4️⃣ REFERRAL LOGIC (DEPTH + WIDTH) ✅ ADD HERE
        await referralService.processDepthReferral(
            userId,
            pkg.ticket_price
        );

        await referralService.processWidthReferral(userId);

        // 5️⃣ Commit everything
        await client.query("COMMIT");

        return {
            package: pkg.name,
            seatNumber: seat.seat_number,
            ticketPrice: pkg.ticket_price
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};