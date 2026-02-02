const pool = require("../config/db");

exports.getReferralTree = async(req, res) => {
    try {
        const userId = req.user.id;

        // Recursive Query to get downlines up to 6 levels deep
        // + Counts their direct referrals (Width)
        const query = `
            WITH RECURSIVE downline AS (
                -- Anchor member: direct referrals (Level 1)
                SELECT id, name, email, referred_by, 1 as level
                FROM users
                WHERE referred_by = $1
                
                UNION ALL
                
                -- Recursive member: referrals of referrals
                SELECT u.id, u.name, u.email, u.referred_by, d.level + 1
                FROM users u
                INNER JOIN downline d ON u.referred_by = d.id
                WHERE d.level < 6
            )
            SELECT 
                d.id, 
                d.name, 
                d.email, 
                d.level,
                -- Subquery to count how many people THIS user has referred (Width)
                (SELECT COUNT(*) FROM users WHERE referred_by = d.id)::int as referral_count
            FROM downline d
            ORDER BY d.level ASC, d.id ASC;
        `;

        const result = await pool.query(query, [userId]);

        // Returns: [{ id: 5, name: "John", level: 1, referral_count: 3 }, ...]
        res.json(result.rows);

    } catch (error) {
        console.error("GET REFERRAL TREE ERROR:", error);
        res.status(500).json({ message: "Failed to fetch referral tree" });
    }
};