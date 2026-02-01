// Load environment variables
require("dotenv").config();

// Import app
const app = require("./app");

// Get port from .env or default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});