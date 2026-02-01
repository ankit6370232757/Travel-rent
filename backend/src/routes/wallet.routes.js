const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const walletController = require("../controllers/wallet.controller");

router.get("/", authMiddleware, walletController.getWallet);
router.post("/withdraw", authMiddleware, walletController.withdraw);
router.get("/withdrawals", authMiddleware, walletController.withdrawHistory);

module.exports = router;