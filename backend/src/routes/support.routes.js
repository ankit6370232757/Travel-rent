const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

// POST /api/support/create - Submit a new support ticket
router.post("/create", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and Message are required" });
        }

        // Insert into DB
        await pool.query(
            "INSERT INTO support_tickets (user_id, subject, message) VALUES ($1, $2, $3)", [userId, subject, message]
        );

        res.json({ message: "Support ticket created successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error submitting ticket" });
    }
});

module.exports = router;