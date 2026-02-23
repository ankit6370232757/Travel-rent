const express = require("express");
const router = express.Router();
const incomeService = require("../services/income.service");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

// ✅ Fully Updated History Route with Expiry Logic
router.get("/history", authMiddleware, async(req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const userId = req.user.id;

        // Joined with packages and batch completion date to show "Days Left"
        const query = `
            SELECT 
                l.amount, 
                l.income_type, 
                l.created_at, 
                p.name as package_name,
                -- 🟢 Calculate remaining days from the 365-day limit
                GREATEST(0, 365 - (CURRENT_DATE - b.completion_date::date)) as days_remaining
            FROM income_logs l
            JOIN packages p ON l.package_id = p.id
            -- 🟢 Subquery to find when the batch was actually finished
            LEFT JOIN (
                SELECT package_id, batch_number, MAX(booked_at) as completion_date
                FROM seats 
                GROUP BY package_id, batch_number
            ) b ON l.package_id = b.package_id AND l.seat_id IN (
                SELECT id FROM seats WHERE batch_number = b.batch_number
            )
            WHERE l.user_id = $1 
            ORDER BY l.created_at DESC`;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("HISTORY FETCH ERROR:", err);
        res.status(500).json({ message: "Failed to fetch income history" });
    }
});

// ... keep existing routes below ...
router.post("/daily", async(_, res) => {
    await incomeService.runDailyIncome();
    res.json({ message: "Daily income executed" });
});

router.post("/monthly", async(_, res) => {
    await incomeService.runMonthlyIncome();
    res.json({ message: "Monthly income executed" });
});

router.post("/yearly", async(_, res) => {
    await incomeService.runYearlyIncome();
    res.json({ message: "Yearly income executed" });
});

module.exports = router;