const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.register = async(req, res) => {
    try {
        const { name, email, password, referralCode, phoneNumber } = req.body;

        // Validation
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check existing user
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1 OR phone_number = $2", [email, phoneNumber]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email or Phone already registered" });
        }

        // Find referrer
        let referredBy = null;
        if (referralCode) {
            const refUser = await pool.query(
                "SELECT id FROM users WHERE referral_code = $1", [referralCode]
            );
            if (refUser.rows.length > 0) {
                referredBy = refUser.rows[0].id;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const myReferralCode = uuidv4().slice(0, 8).toUpperCase();

        // 🟢 Insert user with is_active = TRUE by default
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, referral_code, referred_by, phone_number, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id`, [name, email, hashedPassword, myReferralCode, referredBy, phoneNumber]
        );

        await pool.query(
            "INSERT INTO wallets (user_id, balance) VALUES ($1, 0)", [newUser.rows[0].id]
        );

        res.status(201).json({
            message: "User registered successfully",
            referralCode: myReferralCode
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Get User including is_active status
        const userRes = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = userRes.rows[0];

        // 🟢 2. Security Check: Block deactivated users
        if (user.is_active === false) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact support."
            });
        }

        // 3. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4. Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                referralCode: user.referral_code,
                phoneNumber: user.phone_number,
                isActive: user.is_active
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login failed" });
    }
};

exports.getDashboardStats = async(req, res) => {
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    try {
        const userQuery = await pool.query(
            "SELECT referral_code FROM users WHERE id = $1", [userId]
        );

        const myReferralCode = (userQuery.rows && userQuery.rows.length > 0) ?
            userQuery.rows[0].referral_code :
            null;

        const [balanceRes, profitRes, plansRes, networkRes] = await Promise.all([
            pool.query("SELECT balance FROM wallets WHERE user_id = $1", [userId]),
            pool.query("SELECT SUM(amount) as total FROM income_logs WHERE user_id = $1", [userId]),
            pool.query("SELECT COUNT(*) as count FROM seats WHERE user_id = $1 AND status = 'OCCUPIED'", [userId]),
            myReferralCode ?
            pool.query("SELECT COUNT(*) as count FROM users WHERE referred_by = $1", [userId]) :
            Promise.resolve({ rows: [{ count: 0 }] })
        ]);

        const balance = (balanceRes.rows[0] && balanceRes.rows[0].balance) ?
            Number(balanceRes.rows[0].balance) : 0;

        const totalEarnings = (profitRes.rows[0] && profitRes.rows[0].total) ?
            Number(profitRes.rows[0].total) : 0;

        const activePlans = (plansRes.rows[0] && plansRes.rows[0].count) ?
            Number(plansRes.rows[0].count) : 0;

        const totalReferrals = (networkRes.rows[0] && networkRes.rows[0].count) ?
            Number(networkRes.rows[0].count) : 0;

        res.json({
            balance,
            totalEarnings,
            activePlans,
            totalReferrals
        });

    } catch (err) {
        console.error("❌ Dashboard Stats Error:", err.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};