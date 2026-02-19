const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // 🟢 Import pool to check DB status

module.exports = async(req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Malformed token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🟢 1. Check database to ensure user is still active
        // This is important because tokens last 7 days, but you might block them today
        const userCheck = await pool.query(
            "SELECT is_active, role FROM users WHERE id = $1", [decoded.id]
        );

        if (userCheck.rows.length === 0) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        if (userCheck.rows[0].is_active === false) {
            return res.status(403).json({ message: "Account deactivated" });
        }

        // 🟢 2. Attach updated info to the request object
        req.user = {
            id: decoded.id, // This will be your new 6-digit ID
            email: decoded.email,
            role: userCheck.rows[0].role // Get role directly from DB for security
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};