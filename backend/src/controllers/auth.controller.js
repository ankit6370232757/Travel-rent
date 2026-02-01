const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.register = async(req, res) => {
    try {
        const { name, email, password, referralCode } = req.body;

        // Check existing user
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1", [email]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate referral code
        const myReferralCode = uuidv4().slice(0, 8).toUpperCase();

        // Insert user
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`, [name, email, hashedPassword, myReferralCode, referredBy]
        );

        // Create wallet
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

        const userRes = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = userRes.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                referralCode: user.referral_code
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};