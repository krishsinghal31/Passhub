// backend/src/routes/analyticsrouter.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/role");

const adminAnalytics = require("../controllers/adminanalytics");
const placeAnalytics = require("../controllers/placeanalytics");

// Admin analytics
router.get("/admin/peak-activity", authMiddleware, authorize("ADMIN", "SUPER_ADMIN"), adminAnalytics.getPeakActivity);
router.get("/admin/avg-visit-duration", authMiddleware, authorize("ADMIN", "SUPER_ADMIN"), adminAnalytics.getAverageVisitDuration);
router.get("/admin/traffic-by-place", authMiddleware, authorize("ADMIN", "SUPER_ADMIN"), adminAnalytics.getTrafficByPlace);

// Place analytics
router.get("/place/:placeId/visit-stats", authMiddleware, authorize("HOST", "ADMIN", "SUPER_ADMIN"), placeAnalytics.getPlaceVisitStats);

module.exports = router;