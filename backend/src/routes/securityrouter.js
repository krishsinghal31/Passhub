// backend/routes/securityrouter.js - UPDATED
const express = require("express");
const router = express.Router();

const requireSecurity = require("../middlewares/securityauth");
const securityLoginController = require("../controllers/security-login");
const scanController = require("../controllers/scancontroller");

// Security login
router.post("/login", securityLoginController.loginAsSecurity);

// // Get invite details (no auth needed)
// router.get("/invite/:securityId", async (req, res) => {
//   try {
//     const { securityId } = req.params;
//     const Security = require("../models/security");

//     const security = await Security.findById(securityId).populate("place", "name location");

//     if (!security) {
//       return res.status(404).json({
//         success: false,
//         message: "Invitation not found"
//       });
//     }

//     res.json({
//       success: true,
//       security: {
//         _id: security._id,
//         email: security.email,
//         status: security.status,
//         place: security.place,
//         assignmentPeriod: security.assignmentPeriod
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// });


// Change password
router.post("/change-password", requireSecurity, securityLoginController.changePassword);

// Scan pass
router.post("/scan-pass", requireSecurity, scanController.scanPass);

// Security dashboard
router.get("/dashboard", requireSecurity, scanController.getSecurityDashboard);

// Security activity logs
router.get("/activity", requireSecurity, scanController.getSecurityActivity);

module.exports = router;