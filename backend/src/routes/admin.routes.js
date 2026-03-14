const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");
const supportController = require("../controllers/support.controller"); // 👈 Ye line check karo

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

router.get("/packages", adminController.getAllPackages);
router.post("/packages", authMiddleware, adminController.addPackage);
router.put("/packages/:id/status", authMiddleware, adminController.togglePackageStatus); // 👈 New Toggle Route
router.delete("/packages/:id", authMiddleware, adminController.deletePackage);
router.put("/packages/:id", authMiddleware, adminController.updatePackage);

router.patch("/users/:id/status", authMiddleware, adminController.toggleUserStatus);

router.get("/settings", authMiddleware, adminController.getSettings);
router.post("/settings", authMiddleware, adminController.updateSettings);

router.get("/pending-count", authMiddleware, adminController.getPendingCount);

router.get("/finance/all-logs", authMiddleware, adminController.getAllFinanceLogs);

router.get("/tickets", authMiddleware, supportController.getAllTickets);
router.post("/reply-ticket", authMiddleware, supportController.replyTicket);
module.exports = router;