const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const supportController = require("../controllers/support.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.post("/create", authMiddleware, supportController.createTicket);
router.get("/my-tickets", authMiddleware, supportController.getMyTickets);

module.exports = router;