const bookingService = require("../services/booking.service");
const pool = require("../config/db"); // 👈 THIS WAS MISSING!

exports.bookSeat = async(req, res) => {
    try {
        const userId = req.user.id;
        const { packageName } = req.body;

        if (!packageName) {
            return res.status(400).json({ message: "Package name is required" });
        }

        const result = await bookingService.bookSeat(userId, packageName);

        res.status(200).json({
            message: "Seat booked successfully ✅",
            data: result
        });

    } catch (error) {
        console.error("BOOK SEAT ERROR 👉", error.message);
        res.status(400).json({ message: error.message });
    }
};

// ✅ NEW: Get All Bookings for Admin
exports.getAllBookings = async(req, res) => {
    try {
        const query = `
            SELECT 
                s.seat_number, 
                s.booked_at, 
                p.name as package_name, 
                p.ticket_price,
                u.email,
                u.name as user_name
            FROM seats s
            JOIN packages p ON s.package_id = p.id
            JOIN users u ON s.user_id = u.id
            WHERE s.status = 'BOOKED'
            ORDER BY s.booked_at DESC
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};