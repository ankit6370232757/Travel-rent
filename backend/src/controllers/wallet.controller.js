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
        // 🟢 FIX: Accept both naming conventions from frontend
        const { amount } = req.body;
        const transaction_id = req.body.transaction_id || req.body.transactionId;

        const userId = req.user.id;

        // 1. Validation
        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: "Invalid deposit amount" });
        }

        // Check if transaction_id exists after checking both naming styles
        if (!transaction_id || transaction_id.toString().trim().length < 6) {
            return res.status(400).json({ message: "A valid Transaction ID (UTR) is required." });
        }

        // 2. Prevent Duplicate Transaction IDs
        const duplicateCheck = await pool.query(
            "SELECT id FROM deposits WHERE transaction_id = $1", [transaction_id.toString().trim()]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ message: "This Transaction ID has already been submitted." });
        }

        // 3. Call service to save
        const result = await walletService.requestDeposit(userId, amount, transaction_id);

        res.json({
            success: true,
            message: "Deposit request submitted! Waiting for admin verification.",
            data: result
        });
    } catch (err) {
        console.error("Deposit Request Error:", err.message);
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

exports.getSystemStatus = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT withdraw_status, deposit_status, announcement_text, announcement_image FROM system_settings WHERE id = 1"
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching system status" });
    }
};