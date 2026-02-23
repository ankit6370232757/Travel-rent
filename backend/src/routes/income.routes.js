const express = require("express");
const router = express.Router();
const incomeService = require("../services/income.service");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

// ✅ Updated History Route to filter only Package Incomes
router.get("/history", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                l.amount, 
                l.income_type, 
                l.created_at, 
                p.name as package_name,
                GREATEST(0, 365 - (CURRENT_DATE - b.completion_date::date)) as days_remaining
            FROM income_logs l
            JOIN packages p ON l.package_id = p.id
            LEFT JOIN (
                SELECT package_id, batch_number, MAX(booked_at) as completion_date
                FROM seats 
                GROUP BY package_id, batch_number
            ) b ON l.package_id = b.package_id
            WHERE l.user_id = $1 
            -- 🟢 Only allow Daily, Monthly, and Yearly Package Incomes
            AND l.income_type IN ('DAILY', 'MONTHLY', 'YEARLY') 
            ORDER BY l.created_at DESC`;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch earning history" });
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
// 🟢 NEW: Get Analytics data with growth indicator
router.get("/analytics", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get daily totals for the graph (Last 30 days)
        const graphData = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                SUM(amount)::float as amount
            FROM income_logs
            WHERE user_id = $1 
            AND income_type IN ('DAILY', 'MONTHLY', 'YEARLY')
            GROUP BY date
            ORDER BY date ASC
            LIMIT 30`, [userId]);

        // 2. Calculate Growth Percentage (This week vs Last week)
        const growthRes = await pool.query(`
            SELECT 
                SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END) as this_week,
                SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' THEN amount ELSE 0 END) as last_week
            FROM income_logs
            WHERE user_id = $1 AND income_type IN ('DAILY', 'MONTHLY', 'YEARLY')`, [userId]);

        const { this_week, last_week } = growthRes.rows[0];
        let growth = 0;
        if (Number(last_week) > 0) {
            growth = ((Number(this_week) - Number(last_week)) / Number(last_week)) * 100;
        } else if (Number(this_week) > 0) {
            growth = 100; // 100% growth if there was nothing last week
        }

        res.json({
            chartData: graphData.rows,
            growth: growth.toFixed(1),
            thisWeekTotal: Number(this_week || 0).toFixed(2)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Analytics fetch failed" });
    }
});

module.exports = router;