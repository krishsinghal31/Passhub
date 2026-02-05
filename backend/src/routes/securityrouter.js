// backend/routes/securityrouter.js 
const express = require("express");
const router = express.Router();

const requireSecurity = require("../middlewares/securityauth");
const securityLoginController = require("../controllers/security-login");
const scanController = require("../controllers/scancontroller");
const authMiddleware = require("../middlewares/auth");

//router.post("/login", securityLoginController.loginAsSecurity);
//router.post("/change-password", requireSecurity, securityLoginController.changePassword);
router.get("/my-assignments", authMiddleware, securityLoginController.getMyWork);
router.post("/scan-pass", requireSecurity, scanController.scanPass);
router.get("/dashboard/:placeId", requireSecurity, scanController.getSecurityDashboard);
router.get("/activity/:placeId", requireSecurity, scanController.getSecurityActivity);

module.exports = router;