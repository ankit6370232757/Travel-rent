const cron = require("node-cron");
const incomeService = require("../services/income.service");

cron.schedule("0 0 * * *", async() => {
    console.log("Running daily income job...");
    await incomeService.runDailyIncome();
});