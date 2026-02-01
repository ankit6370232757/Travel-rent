const walletService = require("../services/wallet.service");

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