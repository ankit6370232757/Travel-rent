const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.register = async(req, res) => {
    try {
        const { name, email, password, referralCode } = req.body;

        // 1. Check existing user
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1", [email]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // 2. Find referrer (if code provided)
        let referredBy = null;
        if (referralCode) {
            const refUser = await pool.query(
                "SELECT id FROM users WHERE referral_code = $1", [referralCode]
            );
            if (refUser.rows.length > 0) {
                referredBy = refUser.rows[0].id;
            }
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate unique referral code
        const myReferralCode = uuidv4().slice(0, 8).toUpperCase();

        // 5. Insert user (Default role is handled by DB default usually, or you can add it here)
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`, [name, email, hashedPassword, myReferralCode, referredBy]
        );

        // 6. Create wallet for new user
        await pool.query(
            "INSERT INTO wallets (user_id, balance) VALUES ($1, 0)", [newUser.rows[0].id]
        );

        res.status(201).json({
            message: "User registered successfully",
            referralCode: myReferralCode
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed" });
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

        // 3. Generate Token (✅ Added 'role' here for security)
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        // 4. Send Response (✅ Added 'role' here for Frontend Sidebar)
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // 👈 CRITICAL FIX: The sidebar needs this!
                referralCode: user.referral_code
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};