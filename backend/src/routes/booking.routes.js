const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const bookingController = require("../controllers/booking.controller");

router.post(
    "/book-seat",
    authMiddleware,
    bookingController.bookSeat
);
router.get("/all", authMiddleware, bookingController.getAllBookings);

module.exports = router;