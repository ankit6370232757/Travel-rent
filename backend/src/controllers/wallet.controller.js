const walletService = require("../services/wallet.service");
const pool = require("../config/db");
exports.getWallet = async(req, res) => {
    try {
        const wallet = await walletService.getWallet(req.user.id);
        res.json(wallet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ NEW: Deposit Request
exports.requestDeposit = async(req, res) => {
    try {
        const { amount } = req.body;
        const result = await walletService.requestDeposit(req.user.id, amount);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.withdraw = async(req, res) => {
    try {
        const { amount } = req.body;
        const result = await walletService.withdraw(req.user.id, amount);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.withdrawHistory = async(req, res) => {
    try {
        const history = await walletService.withdrawHistory(req.user.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// 1. Add New Withdrawal Account
exports.addWithdrawalAccount = async(req, res) => {
    try {
        const { methodName, address, qrCode } = req.body;
        const userId = req.user.id;

        if (!methodName || !address) {
            return res.status(400).json({ message: "Method and Address are required" });
        }

        await pool.query(
            "INSERT INTO withdrawal_accounts (user_id, method_name, address, qr_code) VALUES ($1, $2, $3, $4)", [userId, methodName, address, qrCode]
        );

        res.json({ success: true, message: "Withdrawal Account Saved!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get User's Saved Accounts
exports.getWithdrawalAccounts = async(req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query("SELECT * FROM withdrawal_accounts WHERE user_id = $1 ORDER BY id DESC", [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
// Get Allowed Withdrawal Methods (For Users)
exports.getWithdrawalMethods = async(req, res) => {
    try {
        // Only fetch ACTIVE methods
        const result = await pool.query("SELECT * FROM withdrawal_methods WHERE status = TRUE ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};