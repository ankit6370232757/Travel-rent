const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Public route to get non-sensitive settings
router.get("/announcement", async(req, res) => {
    try {
        // 🟢 FIXED: Added announcement_image to the SELECT query
        const query = `
            SELECT 
                announcement_text, 
                announcement_image, 
                maintenance_mode 
            FROM system_settings 
            WHERE id = 1
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Settings not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Public Announcement Fetch Error:", err);
        res.status(500).json({ message: "Error fetching announcement" });
    }
});

module.exports = router;