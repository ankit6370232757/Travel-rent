const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "travel_rent_system",
    port: 5432,
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
    console.error("❌ PostgreSQL error", err);
});

module.exports = pool;