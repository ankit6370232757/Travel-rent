// Load environment variables
require("dotenv").config();

// Import app
const app = require("./app");

// ✅ CRITICAL: Initialize Cron Jobs (Daily/Monthly/Yearly Income)
// This line makes sure the scheduler starts when the server starts.
require("./cron/dailyIncome.cron");

// Get port from .env or default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

});