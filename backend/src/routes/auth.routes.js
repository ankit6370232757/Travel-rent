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
        const { name, email, password } = req.body;

        // 1. Validations
        if (!name || !email) {
            return res.status(400).json({ message: "Name and Email are required" });
        }

        // 2. Build Query dynamically based on whether password is provided
        let query, params;

        if (password && password.length > 0) {
            // User wants to change password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            query = "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email";
            params = [name, email, hashedPassword, userId];
        } else {
            // Only update info, keep old password
            query = "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email";
            params = [name, email, userId];
        }

        // 3. Execute
        const result = await pool.query(query, params);

        // 4. Return updated user (excluding password)
        res.json({ message: "Profile updated successfully", user: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error updating profile" });
    }
});

module.exports = router;