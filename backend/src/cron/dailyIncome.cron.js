const cron = require("node-cron");
const incomeService = require("../services/income.service");

// 🕒 Schedule: Runs every day at Midnight (00:00)
// This single job handles Daily, Monthly, and Yearly checks automatically.
cron.schedule("0 0 * * *", async() => {
    console.log("⏰ CRON JOB STARTED: Processing Income Distributions...");

    try {
        // 1. Run Daily Income
        console.log("--- Step 1: Daily Income ---");
        await incomeService.runDailyIncome();

        // 2. Run Monthly Income
        console.log("--- Step 2: Monthly Income ---");
        await incomeService.runMonthlyIncome();

        // 3. Run Yearly Income
        console.log("--- Step 3: Yearly Income ---");
        await incomeService.runYearlyIncome();

        console.log("✅ CRON JOB FINISHED: All distributions complete.");

    } catch (error) {
        console.error("❌ CRON FAILED:", error.message);
    }
}, {
    timezone: "Asia/Kolkata" // Runs at 00:00 IST
});

console.log("✅ Income Cron Job Initialized (Daily, Monthly, Yearly)");