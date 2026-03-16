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

// Get package breakdown of a downline member (Safe for users)
exports.getDownlineMemberPackages = async(req, res) => {
    try {
        const referrerId = req.user.id; // The logged-in user (upline)
        const memberId = req.params.id; // The downline member being analyzed

        // 1. SECURITY CHECK: Verify relationship within 6 levels
        const verifyQuery = `
            WITH RECURSIVE downline_check AS (
                SELECT id, referred_by, 1 as depth
                FROM users
                WHERE referred_by = $2
                UNION ALL
                SELECT u.id, u.referred_by, dc.depth + 1
                FROM users u
                INNER JOIN downline_check dc ON u.referred_by = dc.id
                WHERE dc.depth < 6
            )
            SELECT depth FROM downline_check WHERE id = $1 LIMIT 1;
        `;

        const verifyRes = await pool.query(verifyQuery, [memberId, referrerId]);

        if (verifyRes.rows.length === 0) {
            return res.status(403).json({
                message: "Access denied. Member is not within your 6-level network."
            });
        }

        const relationshipDepth = verifyRes.rows[0].depth;

        // 2. FETCH DATA: Join seats, packages, AND income_logs 
        // We filter income_logs by referrerId to show only YOUR earnings from this member
        const query = `
            SELECT 
                p.name as package_name,
                p.ticket_price,
                p.code as package_code,
                s.booked_at,
                s.income_type,
                s.id as seat_id,
                COALESCE(il.amount, 0) as commission_earned,
                il.income_type as referral_type
            FROM seats s
            JOIN packages p ON s.package_id = p.id
            LEFT JOIN income_logs il ON s.id = il.seat_id AND il.user_id = $2
            WHERE s.user_id = $1 AND s.status = 'OCCUPIED'
            ORDER BY s.booked_at DESC;
        `;

        const result = await pool.query(query, [memberId, referrerId]);

        // Return enriched data
        res.json({
            packages: result.rows,
            depth: relationshipDepth
        });

    } catch (err) {
        console.error("Downline Package Error:", err.message);
        res.status(500).json({ message: "Server error fetching member data" });
    }
};