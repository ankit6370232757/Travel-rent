const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const referralController = require("../controllers/referral.controller");

// Route: /api/referrals/tree
router.get("/tree", authMiddleware, referralController.getReferralTree);

module.exports = router;