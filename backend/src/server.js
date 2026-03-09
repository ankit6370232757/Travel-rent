// // Load environment variables
// require("dotenv").config();

// // Import app
// const app = require("./app");

// // ✅ CRITICAL: Initialize Cron Jobs (Daily/Monthly/Yearly Income)
// // This line makes sure the scheduler starts when the server starts.
// require("./cron/dailyIncome.cron");

// // Get port from .env or default
// const PORT = process.env.PORT || 5000;

// // Start server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);

// });
// Load environment variables
require("dotenv").config();

// Import app
const app = require("./app");

// Import the income service for the manual trigger
const incomeService = require("./services/income.service");

// ✅ CRITICAL: Initialize Cron Jobs (Daily/Monthly/Yearly Income)
require("./cron/dailyIncome.cron");

// Get port from .env or default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async() => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    try {
        console.log("⚠️ EMERGENCY CATCH-UP: Checking for missed income logs...");

        // This line runs the logic immediately to fill the gap 
        // between March 1st and today
        await incomeService.runDailyIncome();

        console.log("✅ CATCH-UP PROCESS COMPLETED.");
    } catch (error) {
        console.error("❌ EMERGENCY CATCH-UP FAILED:", error.message);
    }
});