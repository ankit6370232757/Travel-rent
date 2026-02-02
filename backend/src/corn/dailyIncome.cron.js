const cron = require("node-cron");
const incomeService = require("../services/income.service");

// 🕒 Schedule: Runs every day at Midnight (00:00)
cron.schedule("0 0 * * *", async() => {
    console.log("🔄 CRON: Starting Daily Income Distribution...");
    try {
        await incomeService.runDailyIncome();
        console.log("✅ CRON: Daily Income Distribution Complete.");
    } catch (error) {
        console.error("❌ CRON FAILED:", error.message);
    }
}, {
    timezone: "Asia/Kolkata" // Optional: Adjust to your timezone
});

console.log("✅ Daily Income Cron Job Initialized (00:00 Daily)");