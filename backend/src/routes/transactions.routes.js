const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/transactions/my-history
router.get("/my-history", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;

        const query = `
      (
        -- 1. DEPOSITS
        SELECT 
          id, 
          amount::numeric, 
          'DEPOSIT'::text as type, 
          status::text, 
          created_at as date 
        FROM deposits 
        WHERE user_id = $1
      )
      UNION ALL
      (
        -- 2. WITHDRAWALS
        SELECT 
          id, 
          amount::numeric, 
          'WITHDRAWAL'::text as type, 
          status::text, 
          created_at as date 
        FROM withdrawals 
        WHERE user_id = $1
      )
      UNION ALL
      (
        -- 3. INCOME (Daily, Referral, etc.)
        SELECT 
          id, 
          amount::numeric, 
          income_type::text as type, 
          'CREDITED'::text as status, 
          created_at as date 
        FROM income_logs 
        WHERE user_id = $1
      )
      UNION ALL
      (
        -- 4. INVESTMENTS (Package Purchases)
        SELECT 
          s.id, 
          p.ticket_price::numeric as amount, 
          'INVESTMENT'::text as type, 
          'CONFIRMED'::text as status, 
          s.booked_at as date 
        FROM seats s
        JOIN packages p ON s.package_id = p.id
        WHERE s.user_id = $1
      )
      ORDER BY date DESC
      LIMIT 100; -- Increased limit for better history depth
    `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);

    } catch (err) {
        console.error("❌ Transaction History Error:", err.message);
        res.status(500).json({ message: "Server error fetching history" });
    }
});

module.exports = router;