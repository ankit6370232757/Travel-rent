const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seat.controller");

router.get("/all-status", seatController.getAllPackagesWithStatus);
router.get("/status/:packageName", seatController.getSeatStatus);

module.exports = router;