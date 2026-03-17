const pool = require("../config/db");

exports.getSeatStatus = async(req, res) => {
    try {
        const { packageName } = req.params;

        // 1. Get Full Package Details
        // 🟢 FIX: Changed '=' to 'ILIKE' and removed '.toUpperCase()' 
        // This makes the search case-insensitive so 'apppppp' and 'APPPPPP' both work.
        const pkgRes = await pool.query(
            "SELECT id, name, ticket_price, daily_income, monthly_income, yearly_income, ots_income, total_seats, code, created_at FROM packages WHERE name ILIKE $1", 
            [packageName]
        );

        if (pkgRes.rows.length === 0) {
            return res.status(404).json({ message: `Package '${packageName}' not found` });
        }

        const pkg = pkgRes.rows[0];

        // USE DB 'total_seats' AS BATCH SIZE
        const BATCH_SIZE = pkg.total_seats || 180;

        // 2. Count Filled Seats (Global count)
        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'OCCUPIED'", 
            [pkg.id]
        );

        const filledSeats = Number(filledRes.rows[0].count);

        // 3. Calculate Batch Progress
        const currentBatch = Math.floor(filledSeats / BATCH_SIZE) + 1;
        const seatsInCurrentBatch = filledSeats % BATCH_SIZE;
        const remainingSeats = BATCH_SIZE - seatsInCurrentBatch;

        // 4. Get the Start Date of the CURRENT Batch
        const offset = (currentBatch - 1) * BATCH_SIZE;
        const batchStartRes = await pool.query(
            `SELECT booked_at FROM seats 
             WHERE package_id = $1 AND status = 'OCCUPIED' 
             ORDER BY booked_at ASC 
             LIMIT 1 OFFSET $2`, 
            [pkg.id, offset]
        );

        // If batch has started, use first seat's date. Otherwise, use package created_at.
        const batchStartDate = batchStartRes.rows.length > 0 
            ? batchStartRes.rows[0].booked_at 
            : pkg.created_at;

        res.json({
            id: pkg.id,
            name: pkg.name,
            ticket_price: pkg.ticket_price,
            daily_income: pkg.daily_income,
            monthly_income: pkg.monthly_income,
            yearly_income: pkg.yearly_income,
            ots_income: pkg.ots_income,
            code: pkg.code,
            createdAt: pkg.created_at,
            batchStartDate: batchStartDate,
            batchSize: BATCH_SIZE,
            currentBatch: currentBatch,
            filledSeats: filledSeats,
            seatsInCurrentBatch: seatsInCurrentBatch,
            remainingSeats: remainingSeats,
            isBatchFull: seatsInCurrentBatch === 0 && filledSeats > 0
        });

    } catch (err) {
        console.error("GET SEAT STATUS ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
};

// admin.controller.js
exports.getPackagesWithStatus = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                COALESCE(s.total_occupied, 0) as "filledSeats",
                (COALESCE(s.total_occupied, 0) % p.total_seats) as "seatsInCurrentBatch",
                FLOOR(COALESCE(s.total_occupied, 0) / p.total_seats) + 1 as "currentBatch",
                (
                    SELECT booked_at FROM seats 
                    WHERE package_id = p.id AND status = 'OCCUPIED' 
                    ORDER BY booked_at ASC 
                    LIMIT 1 OFFSET (FLOOR(COALESCE(s.total_occupied, 0) / p.total_seats) * p.total_seats)
                ) as "batchStartDate"
            FROM packages p
            LEFT JOIN (
                SELECT package_id, COUNT(*) as total_occupied 
                FROM seats WHERE status = 'OCCUPIED' 
                GROUP BY package_id
            ) s ON p.id = s.package_id
            WHERE p.is_active = TRUE
            ORDER BY p.ticket_price ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};












// const pool = require("../config/db");

// exports.getSeatStatus = async(req, res) => {
//     try {
//         const { packageName } = req.params;

//         // 1. Get Full Package Details
//         const pkgRes = await pool.query(
//             "SELECT id, name, ticket_price, daily_income, monthly_income, yearly_income, ots_income, total_seats, code, created_at FROM packages WHERE name = $1", [packageName.toUpperCase()]
//         );

//         if (pkgRes.rows.length === 0) {
//             return res.status(404).json({ message: "Package not found" });
//         }

//         const pkg = pkgRes.rows[0];

//         // ⚠️ USE DB 'total_seats' AS BATCH SIZE
//         const BATCH_SIZE = pkg.total_seats || 180;

//         // 2. Count Filled Seats (Global count)
//         const filledRes = await pool.query(
//             "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'OCCUPIED'", [pkg.id]
//         );

//         const filledSeats = Number(filledRes.rows[0].count);

//         // 3. Calculate Batch Progress
//         const currentBatch = Math.floor(filledSeats / BATCH_SIZE) + 1;
//         const seatsInCurrentBatch = filledSeats % BATCH_SIZE;
//         const remainingSeats = BATCH_SIZE - seatsInCurrentBatch;

// // 4. NEW: Get the Start Date of the CURRENT Batch
//         // We find the 'booked_at' date of the very first seat in the current batch range
//         const offset = (currentBatch - 1) * BATCH_SIZE;
//         const batchStartRes = await pool.query(
//             `SELECT booked_at FROM seats 
//              WHERE package_id = $1 AND status = 'OCCUPIED' 
//              ORDER BY booked_at ASC 
//              LIMIT 1 OFFSET $2`, 
//             [pkg.id, offset]
//         );

//         // If batch has started, use first seat's date. Otherwise, use package created_at.
//         const batchStartDate = batchStartRes.rows.length > 0 
//             ? batchStartRes.rows[0].booked_at 
//             : pkg.created_at;

//         res.json({
//             // Package Info
//             id: pkg.id,
//             name: pkg.name,
//             ticket_price: pkg.ticket_price,
//             daily_income: pkg.daily_income,
//             monthly_income: pkg.monthly_income,
//             yearly_income: pkg.yearly_income,
//             ots_income: pkg.ots_income,
//             code: pkg.code,
//             createdAt: pkg.created_at,
//             batchStartDate: batchStartDate, // 🟢 NEW FIELD
//             // Batch & Seat Info
//             batchSize: BATCH_SIZE,
//             currentBatch: currentBatch,

//             // Progress Bar Data
//             filledSeats: filledSeats,
//             seatsInCurrentBatch: seatsInCurrentBatch,
//             remainingSeats: remainingSeats,

//             // Logic if needed
//             isBatchFull: seatsInCurrentBatch === 0 && filledSeats > 0
//         });

//     } catch (err) {
//         console.error("GET SEAT STATUS ERROR:", err.message);
//         res.status(500).json({ message: err.message });
//     }
// };