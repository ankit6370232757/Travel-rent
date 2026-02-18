const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Public route to get non-sensitive settings
router.get("/announcement", async(req, res) => {
    try {
        const result = await pool.query(
            "SELECT announcement_text, maintenance_mode FROM system_settings WHERE id = 1"
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching announcement" });
    }
});

module.exports = router;