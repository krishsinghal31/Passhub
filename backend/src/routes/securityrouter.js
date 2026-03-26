// backend/routes/securityrouter.js 
const express = require("express");
const router = express.Router();

const requireRole = require("../middlewares/securityauth");
const securityLoginController = require("../controllers/security-login");
const scanController = require("../controllers/scancontroller");
const authMiddleware = require("../middlewares/auth");

router.get("/my-assignments", authMiddleware, securityLoginController.getMyWork);
router.post("/scan-pass", authMiddleware, requireRole("SECURITY"), scanController.scanPass);
router.get("/dashboard/:placeId", authMiddleware, requireRole("SECURITY"), scanController.getSecurityDashboard);
router.get("/activity/:placeId", authMiddleware, requireRole("SECURITY"), scanController.getSecurityActivity);

module.exports = router;