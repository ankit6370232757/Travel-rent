const pool = require("../config/db");

exports.getReferralTree = async(req, res) => {
    try {
        const userId = req.user.id;

        // Recursive Query to get downlines up to 6 levels deep
        const query = `
      WITH RECURSIVE downline AS (
        -- Anchor member: direct referrals (Level 1)
        SELECT id, email, referred_by, 1 as level
        FROM users
        WHERE referred_by = $1
        
        UNION ALL
        
        -- Recursive member: referrals of referrals
        SELECT u.id, u.email, u.referred_by, d.level + 1
        FROM users u
        INNER JOIN downline d ON u.referred_by = d.id
        WHERE d.level < 6
      )
      SELECT level, email FROM downline ORDER BY level ASC;
    `;

        const result = await pool.query(query, [userId]);

        // Format for frontend (The frontend handles Array format automatically)
        // It returns: [{ level: 1, email: "a@b.com" }, { level: 2, email: "..." }]
        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch referral tree" });
    }
};