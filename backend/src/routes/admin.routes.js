const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/requests", authMiddleware, adminController.getAllRequests);
router.post("/handle", authMiddleware, adminController.handleRequest);
router.get("/users", authMiddleware, adminController.getAllUsers);
router.post("/payment-methods", authMiddleware, adminController.addPaymentMethod);
router.get("/payment-methods", authMiddleware, adminController.getPaymentMethods); // Public or Auth
router.delete("/payment-methods/:id", authMiddleware, adminController.deletePaymentMethod);
router.put("/payment-methods/:id/status", authMiddleware, adminController.togglePaymentMethod);

router.get("/withdrawal-methods", adminController.getWithdrawalMethods); // Public (for User & Admin)
router.post("/withdrawal-methods", authMiddleware, adminController.addWithdrawalMethod);
router.put("/withdrawal-methods/:id/status", authMiddleware, adminController.toggleWithdrawalMethod);
router.delete("/withdrawal-methods/:id", authMiddleware, adminController.deleteWithdrawalMethod);

router.get("/packages", adminController.getPackages);
router.post("/packages", authMiddleware, adminController.addPackage);
router.put("/packages/:id/status", authMiddleware, adminController.togglePackageStatus); // 👈 New Toggle Route
router.delete("/packages/:id", authMiddleware, adminController.deletePackage);

router.patch("/users/:id/status", authMiddleware, adminController.toggleUserStatus);

router.get("/settings", authMiddleware, adminController.getSettings);
router.post("/settings", authMiddleware, adminController.updateSettings);
module.exports = router;