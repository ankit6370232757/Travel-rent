const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.register = async(req, res) => {
    try {
        // 👇 1. Accept phoneNumber from frontend
        const { name, email, password, referralCode, phoneNumber } = req.body;

        // Validation
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Check existing user (Email OR Phone)
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1 OR phone_number = $2", [email, phoneNumber]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email or Phone already registered" });
        }

        // 3. Find referrer (if code provided)
        let referredBy = null;
        if (referralCode) {
            const refUser = await pool.query(
                "SELECT id FROM users WHERE referral_code = $1", [referralCode]
            );
            if (refUser.rows.length > 0) {
                referredBy = refUser.rows[0].id;
            }
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Generate unique referral code
        const myReferralCode = uuidv4().slice(0, 8).toUpperCase();

        // 6. Insert user (👇 Added phone_number here)
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, referral_code, referred_by, phone_number)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [name, email, hashedPassword, myReferralCode, referredBy, phoneNumber]
        );

        // 7. Create wallet for new user
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

        // 1. Get User
        const userRes = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = userRes.rows[0];

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        // 4. Send Response (👇 Added phone_number to response)
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                referralCode: user.referral_code,
                phoneNumber: user.phone_number // Useful to show in profile later
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};
exports.getDashboardStats = async(req, res) => {
    // Ensure userId exists from middleware
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    try {
        // 1. Fetch the user's own Referral Code first
        const userQuery = await pool.query(
            "SELECT referral_code FROM users WHERE id = $1", [userId]
        );

        const myReferralCode = (userQuery.rows && userQuery.rows.length > 0) ?
            userQuery.rows[0].referral_code :
            null;

        // 2. Run queries in parallel
        const [balanceRes, profitRes, plansRes, networkRes] = await Promise.all([
            // A. Total Balance (wallets table)
            pool.query("SELECT balance FROM wallets WHERE user_id = $1", [userId]),

            // B. Total Profit (income_logs table)
            pool.query("SELECT SUM(amount) as total FROM income_logs WHERE user_id = $1", [userId]),

            // C. Active Plans (seats table)
            pool.query("SELECT COUNT(*) as count FROM seats WHERE user_id = $1 AND status = 'active'", [userId]),

            // D. Network Partners (users table)
            myReferralCode ?
            pool.query("SELECT COUNT(*) as count FROM users WHERE referred_by = $1", [myReferralCode]) :
            Promise.resolve({ rows: [{ count: 0 }] })
        ]);

        // 3. Format results with fallback to 0 to prevent "null" crashes
        const balance = (balanceRes.rows[0] && balanceRes.rows[0].balance) ?
            Number(balanceRes.rows[0].balance) :
            0;

        const totalEarnings = (profitRes.rows[0] && profitRes.rows[0].total) ?
            Number(profitRes.rows[0].total) :
            0;

        const activePlans = (plansRes.rows[0] && plansRes.rows[0].count) ?
            Number(plansRes.rows[0].count) :
            0;

        const totalReferrals = (networkRes.rows[0] && networkRes.rows[0].count) ?
            Number(networkRes.rows[0].count) :
            0;

        // 4. Send clean JSON response
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