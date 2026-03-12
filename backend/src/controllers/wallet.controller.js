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
        // const userId = req.user.id;
        // const { amount, utrNumber } = req.body;

        // if (!utrNumber || utrNumber.trim().length < 8) {
        //     return res.status(400).json({ message: "A valid UTR/Transaction ID is required." });
        // }

        // // Check for duplicate UTR to prevent fraud
        // const duplicateCheck = await pool.query(
        //     "SELECT id FROM deposits WHERE utr_number = $1", [utrNumber]
        // );
        // if (duplicateCheck.rows.length > 0) {
        //     return res.status(400).json({ message: "This UTR has already been submitted." });
        // }

        // const result = await walletService.requestDeposit(userId, amount, utrNumber);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.withdraw = async(req, res) => {
    try {
        const { amount, methodName, address } = req.body;
        const userId = req.user.id;

        // 1. Basic Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }

        // 2. Call your service to handle the logic
        // Ensure your service checks the 'wallets' table for sufficient balance
        // and inserts into the 'withdrawals' table with a 'PENDING' status
        const result = await walletService.withdraw(userId, amount, methodName, address);

        res.json({
            success: true,
            message: "Withdrawal request submitted for approval!",
            data: result
        });
    } catch (err) {
        console.error("Withdraw Error:", err.message);
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