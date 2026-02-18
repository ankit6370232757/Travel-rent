const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const bookingRoutes = require("./routes/booking.routes");
const seatRoutes = require("./routes/seat.routes");
const incomeRoutes = require("./routes/income.routes");
const walletRoutes = require("./routes/wallet.routes");
const referralRoutes = require("./routes/referral.routes");
const adminRoutes = require("./routes/admin.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const supportRoutes = require("./routes/support.routes");
const chatRoutes = require("./routes/chat.Routes");
const publicRoutes = require("./routes/public.routes");

const app = express(); // ✅ app must be created FIRST

app.use(cors({
    origin: true, // 🚀 Allows your Vercel frontend to connect dynamically
    credentials: true, // 🔑 REQUIRED because your axios has 'withCredentials: true'
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
    res.send("Travel Rent Backend is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/settings", publicRoutes);

module.exports = app;