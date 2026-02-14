const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

router.post("/register", authController.register);
router.post("/login", authController.login);

// PUT /api/auth/update-profile
router.put("/update-profile", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;
        // Accept wallet_address now
        const { name, email, password, wallet_address } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and Email are required" });
        }

        let query, params;

        if (password && password.length > 0) {
            // Update WITH password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            query = `
                UPDATE users 
                SET name = $1, email = $2, password = $3, wallet_address = $4
                WHERE id = $5 
                RETURNING id, name, email, referral_code, wallet_address, role
            `;
            params = [name, email, hashedPassword, wallet_address, userId];
        } else {
            // Update WITHOUT password
            query = `
                UPDATE users 
                SET name = $1, email = $2, wallet_address = $3
                WHERE id = $4 
                RETURNING id, name, email, referral_code, wallet_address, role
            `;
            params = [name, email, wallet_address, userId];
        }

        const result = await pool.query(query, params);

        res.json({ message: "Profile updated successfully", user: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error updating profile" });
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
        console.error(err);
        res.status(500).json({ message: "Server error fetching profile" });
    }
});

router.get("/dashboard-stats", authMiddleware, userController.getDashboardStats);

module.exports = router;