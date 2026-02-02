const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const referralController = require("../controllers/referral.controller");

// ✅ NEW ROUTE: Matches your frontend "My Network" page
router.get("/my-network", authMiddleware, referralController.getReferralTree);

// (Optional) Keep this if you use it elsewhere, or remove it
router.get("/tree", authMiddleware, referralController.getReferralTree);

module.exports = router;