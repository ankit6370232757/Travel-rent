const bookingService = require("../services/booking.service");

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