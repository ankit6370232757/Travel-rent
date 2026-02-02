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

const app = express(); // ✅ app must be created FIRST

app.use(cors());
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

module.exports = app;