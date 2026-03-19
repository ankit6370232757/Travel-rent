const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

router.post("/register", authController.register);
router.post("/login", authController.login);

// PUT /api/auth/update-profile
// PUT /api/auth/update-profile
router.put("/update-profile", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;
        // 🔴 REMOVED 'email' from req.body so we don't accidentally overwrite it with NULL
        const { name, password, wallet_address } = req.body;

        let query, params;

        if (password && password.length > 0) {
            // 🔴 REMOVED BCRYPT HERE to match your login logic
            query = `
                UPDATE users 
                SET name = $1, password = $2, wallet_address = $3
                WHERE id = $4 
                RETURNING id, name, email, referral_code, wallet_address, role
            `;
            // Removed email parameter, shifted userId to $4
            params = [name, password, wallet_address, userId];
        } else {
            // Update WITHOUT password
            query = `
                UPDATE users 
                SET name = $1, wallet_address = $2
                WHERE id = $3 
                RETURNING id, name, email, referral_code, wallet_address, role
            `;
            // Removed email parameter, shifted userId to $3
            params = [name, wallet_address, userId];
        }

        const result = await pool.query(query, params);
        res.json({ message: "Profile updated successfully", user: result.rows[0] });

    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/profile", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;

        // Select specific fields including referral_code and wallet_address
        const result = await pool.query(
            "SELECT id, name, email, referral_code, wallet_address, role FROM users WHERE id = $1", [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ message: "Server error fetching profile" });
    }
});

router.get("/dashboard-stats", authMiddleware, authController.getDashboardStats);

module.exports = router;