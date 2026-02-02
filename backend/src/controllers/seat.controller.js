const pool = require("../config/db");

exports.getSeatStatus = async(req, res) => {
    try {
        const { packageName } = req.params;

        // 1. Get Full Package Details
        const pkgRes = await pool.query(
            "SELECT id, name, ticket_price, daily_income, monthly_income, yearly_income, ots_income, total_seats FROM packages WHERE name = $1", [packageName.toUpperCase()]
        );

        if (pkgRes.rows.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }

        const pkg = pkgRes.rows[0];

        // ⚠️ USE DB 'total_seats' AS BATCH SIZE
        const BATCH_SIZE = pkg.total_seats || 180;

        // 2. Count Filled Seats (Global count)
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'OCCUPIED'", [pkg.id]
        );

        const filledSeats = Number(filledRes.rows[0].count);

        // 3. Calculate Batch Progress
        const currentBatch = Math.floor(filledSeats / BATCH_SIZE) + 1;
        const seatsInCurrentBatch = filledSeats % BATCH_SIZE;
        const remainingSeats = BATCH_SIZE - seatsInCurrentBatch;

        res.json({
            // Package Info
            id: pkg.id,
            name: pkg.name,
            ticket_price: pkg.ticket_price,
            daily_income: pkg.daily_income,
            monthly_income: pkg.monthly_income,
            yearly_income: pkg.yearly_income,
            ots_income: pkg.ots_income,

            // Batch & Seat Info
            batchSize: BATCH_SIZE,
            currentBatch: currentBatch,

            // Progress Bar Data
            filledSeats: filledSeats,
            seatsInCurrentBatch: seatsInCurrentBatch,
            remainingSeats: remainingSeats,

            // Logic if needed
            isBatchFull: seatsInCurrentBatch === 0 && filledSeats > 0
        });

    } catch (err) {
        console.error("GET SEAT STATUS ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
};