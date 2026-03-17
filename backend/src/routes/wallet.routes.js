const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const walletController = require("../controllers/wallet.controller");

router.get("/", authMiddleware, walletController.getWallet);
router.get("/announcement", walletController.getSystemStatus);
router.post("/withdraw", authMiddleware, walletController.withdraw);
router.get("/withdrawals", authMiddleware, walletController.withdrawHistory);

// ✅ NEW ROUTE
router.post("/deposit", authMiddleware, walletController.requestDeposit);
router.post("/withdrawal-accounts", authMiddleware, walletController.addWithdrawalAccount);
router.get("/withdrawal-accounts", authMiddleware, walletController.getWithdrawalAccounts);
router.get("/withdrawal-methods-list", authMiddleware, walletController.getWithdrawalMethods);

module.exports = router;