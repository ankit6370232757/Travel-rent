const express = require("express");
const router = express.Router();
const incomeService = require("../services/income.service");
const pool = require("../config/db"); // ✅ Added
const authMiddleware = require("../middleware/auth.middleware"); // ✅ Added

// ✅ THIS WAS MISSING: The route for the Chart
router.get("/history", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT amount, created_at FROM income_logs WHERE user_id = $1 ORDER BY created_at ASC", [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch income history" });
    }
});

// Existing Manual Triggers
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