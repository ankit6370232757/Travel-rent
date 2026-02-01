const pool = require("../config/db");

exports.getSeatStatus = async(req, res) => {
    try {
        const { packageName } = req.params;

        const pkgRes = await pool.query(
            "SELECT id, total_seats FROM packages WHERE name = $1", [packageName.toUpperCase()]
        );

        if (pkgRes.rows.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }

        const pkg = pkgRes.rows[0];

        const filledRes = await pool.query(
            "SELECT COUNT(*) FROM seats WHERE package_id = $1 AND status = 'BOOKED'", [pkg.id]
        );

        const filledSeats = Number(filledRes.rows[0].count);
        const remainingSeats = pkg.total_seats - filledSeats;

        res.json({
            package: packageName.toUpperCase(),
            totalSeats: pkg.total_seats,
            filledSeats,
            remainingSeats,
            isFullyFilled: filledSeats === pkg.total_seats
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};