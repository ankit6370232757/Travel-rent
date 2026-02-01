const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const bookingRoutes = require("./routes/booking.routes");
const seatRoutes = require("./routes/seat.routes");
const incomeRoutes = require("./routes/income.routes");
const walletRoutes = require("./routes/wallet.routes");

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


module.exports = app;