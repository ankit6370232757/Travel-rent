const pool = require("../config/db");

exports.getReferralTree = async(req, res) => {
    try {
        const userId = req.user.id;

        /**
         * 🟢 UPDATED SQL QUERY
         * 1. Added a JOIN with 'income_logs' to calculate the sum of earnings from each user.
         * 2. Filtered income_logs by the current logged-in user (user_id) AND the source (from_user_id).
         * 3. Kept the recursive logic for 6 levels of depth.
         */
        const query = `
            WITH RECURSIVE downline AS (
                -- Anchor member: direct referrals (Level 1)
                SELECT id, name, email, referred_by, created_at, 1 as level
                FROM users
                WHERE referred_by = $1
                
                UNION ALL
                
                -- Recursive member: referrals of referrals
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
                -- Subquery to count how many people THIS user has referred (Width)
                (SELECT COUNT(*) FROM users WHERE referred_by = d.id)::int as referral_count,
                
                -- 🟢 NEW: Sum of all bonuses earned by YOU (the logged-in user) from THIS downline member
                -- Looks for logs where the current user received money FROM this member's actions
                COALESCE((
                    SELECT SUM(amount) 
                    FROM income_logs 
                    WHERE user_id = $1 AND from_user_id = d.id
                ), 0)::float as total_bonus
                
            FROM downline d
            ORDER BY d.level ASC, d.id ASC;
        `;

        const result = await pool.query(query, [userId]);

        // Returns: [{ id, name, level, created_at, referral_count, total_bonus }, ...]
        res.json(result.rows);

    } catch (error) {
        console.error("GET REFERRAL TREE ERROR:", error);
        res.status(500).json({ message: "Failed to fetch referral tree" });
    }
};