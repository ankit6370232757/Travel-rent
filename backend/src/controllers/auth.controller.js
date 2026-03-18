const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

/**
 * 🛠️ Utility: Generate a Unique 6-Digit ID
 */
const generateSixDigitId = async(tableName) => {
    let isUnique = false;
    let newId;

    while (!isUnique) {
        // Generate random number between 100000 and 999999
        newId = Math.floor(100000 + Math.random() * 900000);

        // Check if ID already exists in the table
        const res = await pool.query(`SELECT id FROM ${tableName} WHERE id = $1`, [newId]);
        if (res.rows.length === 0) {
            isUnique = true;
        }
    }
    return newId;
};

exports.register = async(req, res) => {
    try {
        const { name, email, password, referralCode, phoneNumber } = req.body;

        // 1. Validation
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
            } else {
                return res.status(400).json({ message: "Invalid referral code" });
            }
        }

        // 4. 🟢 Generate 6-Digit unique ID
        const userId = await generateSixDigitId('users');

        // 5. Generate unique referral code
        const myReferralCode = uuidv4().slice(0, 8).toUpperCase();

        // 6. 🟢 Insert user (Storing Plaintext Password as requested)
        await pool.query(
            `INSERT INTO users (id, name, email, password, referral_code, referred_by, phone_number, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`, [userId, name, email, password, myReferralCode, referredBy, phoneNumber]
        );

        // 7. Create wallet for new user
        await pool.query(
            "INSERT INTO wallets (user_id, balance) VALUES ($1, 0)", [userId]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: userId, // Returned for the "Flower Blossom" animation
            referralCode: myReferralCode
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

exports.login = async(req, res) => {
    try {
        // 🟢 'identifier' can be either email or phoneNumber from the frontend
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Email/Phone and password are required" });
        }

        // 1. 🟢 Get User by Email OR Phone Number
        const userRes = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", [identifier]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = userRes.rows[0];

        // 2. Security Check: Block deactivated users
        if (user.is_active === false) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact support."
            });
        }

        // 3. 🟢 Check Password (Direct comparison for plaintext)
        if (password !== user.password) {
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
            userQuery.rows[0].referral_code : null;

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