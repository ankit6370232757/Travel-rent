const { Pool } = require("pg");
require("dotenv").config(); // Load variables from .env file

// 1. Determine if we are in "Production" (Cloud) or "Development" (Laptop)
const isProduction = process.env.NODE_ENV === "production";

// 2. Create the connection pool
const pool = new Pool({
    // Instead of host/user/password, we use the full Connection String
    connectionString: process.env.DATABASE_URL,

    // 3. SSL Security (CRUCIAL for Neon/Cloud DBs)
    // Cloud databases require SSL. Local databases usually don't.
    // This line enables SSL only when on the Cloud.
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL connected successfully");
});

pool.on("error", (err) => {
    console.error("❌ PostgreSQL connection error", err);
    process.exit(-1); // Stop the app if DB fails
});

module.exports = pool;