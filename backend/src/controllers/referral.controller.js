const pool = require("../config/db");

exports.getReferralTree = async(req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            WITH RECURSIVE downline AS (
                SELECT id, name, email, referred_by, created_at, 1 as level
                FROM users
                WHERE referred_by = $1
                UNION ALL
                SELECT u.id, u.name, u.email, u.referred_by, u.created_at, d.level + 1
                FROM users u
                INNER JOIN downline d ON u.referred_by = d.id
                WHERE d.level < 6
            )
            SELECT 
                d.id, 
                d.name, 
                d.email, 
                d.level,
                d.created_at, 
                (SELECT COUNT(*)::int FROM users WHERE referred_by = d.id) as referral_count,
                
                -- 🟢 UPDATED: Finding earnings via seat_id instead of from_user_id
                COALESCE((
                    SELECT SUM(il.amount)::float 
                    FROM income_logs il
                    JOIN seats s ON il.seat_id = s.id
                    WHERE il.user_id = $1 AND s.user_id = d.id
                ), 0) as total_bonus
                
            FROM downline d
            ORDER BY d.level ASC, d.created_at DESC;
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);

    } catch (error) {
        console.error("❌ DATABASE ERROR:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getReferralStats = async(req, res) => {
    try {
        const userId = req.user.id;

        // This query counts successful bookings the user has referred, 
        // grouped by the specific package.
        const query = `
            SELECT 
                p.id as package_id, 
                p.name as package_name, 
                COUNT(b.id) as referral_count
            FROM packages p
            LEFT JOIN bookings b ON p.id = b.package_id 
                AND b.referrer_id = $1 
                AND b.status = 'SUCCESS'
            GROUP BY p.id, p.name
            ORDER BY p.id ASC;
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ message: "Failed to load referral stats" });
    }
};