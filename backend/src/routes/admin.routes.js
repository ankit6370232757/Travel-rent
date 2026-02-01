const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/requests", authMiddleware, adminController.getPendingRequests);
router.post("/handle", authMiddleware, adminController.handleRequest);

module.exports = router;