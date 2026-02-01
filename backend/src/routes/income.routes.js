const express = require("express");
const router = express.Router();
const incomeService = require("../services/income.service");

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