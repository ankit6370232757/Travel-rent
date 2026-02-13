const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/requests", authMiddleware, adminController.getPendingRequests);
router.post("/handle", authMiddleware, adminController.handleRequest);
router.get("/users", authMiddleware, adminController.getAllUsers);
router.post("/payment-methods", auth, adminController.addPaymentMethod);
router.get("/payment-methods", auth, adminController.getPaymentMethods); // Public or Auth
router.delete("/payment-methods/:id", auth, adminController.deletePaymentMethod);
module.exports = router;