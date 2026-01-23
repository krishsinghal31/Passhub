below are the all router files in routes folder

adminrouter.js

// backend/routes/admin.js - COMPLETE CORRECT VERSION

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllPasses,
  inviteAdmin,
  disableAdmin,
  disableUser,
  getAllUpcomingEvents,
  getAllHosts,
  toggleUserStatus,
  cancelEventByAdmin,
  getEventDetailsForAdmin
} = require('../controllers/admin');

// Import middlewares - CORRECT PATHS
const auth = require('../middlewares/auth');  
const { adminAuth } = require('../middlewares/adminAuth');  

// Existing routes
router.get('/users', auth, adminAuth, getAllUsers);
router.get('/passes', auth, adminAuth, getAllPasses);
router.post('/invite-admin', auth, adminAuth, inviteAdmin);
router.post('/admins/:adminId/disable', auth, adminAuth, disableAdmin);
router.post('/users/:userId/disable', auth, adminAuth, disableUser);

// ✅ NEW ROUTES
router.get('/events/upcoming', auth, adminAuth, getAllUpcomingEvents);
router.get('/hosts', auth, adminAuth, getAllHosts);
router.post('/users/:userId/toggle', auth, adminAuth, toggleUserStatus);
router.post('/events/:eventId/cancel', auth, adminAuth, cancelEventByAdmin);
router.get('/events/:eventId/details', auth, adminAuth, getEventDetailsForAdmin);

module.exports = router;



analyticsrouter.js

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

authrouter.js

const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/auth");
const authMiddleware = require("../middlewares/auth");
const User = require("../models/user");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("subscription.planId");
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

hostrouter.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const hostAnalytics = require("../controllers/hostanalytics");
const hostController = require("../controllers/host");
const hostingActive = require("../middlewares/hostingactive");
const isPlaceHost = require("../middlewares/isplacehost");

// Create place (requires active subscription)
router.post("/place", authMiddleware, hostingActive, hostController.createPlace);

// Get all hosted places/events
router.get("/places", authMiddleware, hostController.getMyPlaces);
router.get("/events", authMiddleware, hostController.getMyHostedEvents);

// Place management
router.get("/places/:placeId/dashboard", authMiddleware, isPlaceHost, hostController.getPlaceDashboard);
router.put("/places/:placeId", authMiddleware, isPlaceHost, hostingActive, hostController.editPlace);
router.patch("/places/:placeId/capacity", authMiddleware, isPlaceHost, hostController.updateCapacity);
router.post("/places/:placeId/toggle-booking", authMiddleware, isPlaceHost, hostController.toggleBooking);

router.patch("/events/:eventId/dates", authMiddleware, hostController.updateEventDates);

// Security management
router.post("/places/:placeId/invite-security", authMiddleware, isPlaceHost, hostController.inviteSecurity);
router.delete("/places/:placeId/security/:securityId", authMiddleware, isPlaceHost, hostController.removeSecurity);

// Slot management
router.get("/places/:placeId/slots", authMiddleware, isPlaceHost, hostController.getSlots);
router.get('/places/:placeId/security', authMiddleware, hostController.getSecurityForPlace);
router.post("/events/:eventId/manual-override", authMiddleware, hostController.manualOverride);
router.post("/places/:placeId/cancel",isPlaceHost, hostController.cancelMyEvent);
router.put('/places/:placeId/details-notify', authMiddleware, hostController.updateEventDetailsWithNotification);

// Host analytics 
router.get("/events/:eventId/bookings-per-day", authMiddleware, hostAnalytics.getBookingsPerDay);
router.get("/events/:eventId/peak-checkin-hours", authMiddleware, hostAnalytics.getPeakCheckInHours);
router.get("/places/:placeId/analytics/security-activity", authMiddleware, isPlaceHost, hostAnalytics.getSecurityActivity);

module.exports = router;

hostsubscription.js

const router = require("express").Router();
const { purchaseSubscription } = require("../controllers/hostsubscription");
const auth = require("../middlewares/auth");

router.post("/purchase", auth, purchaseSubscription);
router.post("/confirm-payment", auth, confirmSubscriptionPayment); 

module.exports = router;

passrouter.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/role");

const visitorController = require("../controllers/visitor");
const passController = require("../controllers/pass");
const paymentController = require("../controllers/payment");
const refundController = require("../controllers/refund");

// Visitor booking
router.post("/request", authMiddleware, visitorController.createBooking);
router.get("/my-passes", authMiddleware, visitorController.getMyPasses);
router.get("/bookings", authMiddleware, visitorController.getAllBookingsByVisitor);
router.get("/booking/:bookingId", authMiddleware, visitorController.getBookingDetails);

// Cancellation
router.patch("/cancel/:passId", authMiddleware, passController.cancelGuestPass);
router.patch("/cancel-bulk", authMiddleware, passController.cancelMultiplePasses);

// Payment
router.post("/payments/confirm", authMiddleware, paymentController.confirmPayment);

// Refund
router.post("/refund/initiate", authMiddleware, refundController.initiateRefund);

module.exports = router;

placerouter.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/role");
const placeController = require("../controllers/place");

router.get("/search", placeController.searchPlaces);

// Get all active places (public)
router.get("/", placeController.getAllPlaces);

// Get single place details (public)
router.get("/:placeId", placeController.getPlaceById);

module.exports = router;

publicrouter.js

const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public");

// Home page - all events for public display
router.get("/home-events", publicController.getHomeEvents);

// Featured events
router.get("/featured-events", publicController.getFeaturedEvents);

// Categories
router.get("/categories", publicController.getCategories);

module.exports = router;

securityrouter.js

const express = require("express");
const router = express.Router();

const requireSecurity = require("../middlewares/securityauth");
const securityLoginController = require("../controllers/security-login");
const scanController = require("../controllers/scancontroller");
// Security login
router.post("/login", securityLoginController.loginAsSecurity);

// Accept security invite
router.get("/accept/:securityId", securityLoginController.acceptSecurityInvite);

// Also accept token-based invite
router.post("/accept-invite/:inviteToken", securityLoginController.acceptSecurityInvite);

// Change password
router.post("/change-password", requireSecurity, securityLoginController.changePassword);

// Scan pass
router.post("/scan-pass", requireSecurity, scanController.scanPass);

// Security dashboard
router.get("/dashboard", requireSecurity, scanController.getSecurityDashboard);
// Security activity logs
router.get("/activity", requireSecurity, scanController.getSecurityActivity);

module.exports = router;

subscriptionrouter.js

const router = require("express").Router();
const { createPlan, getPlans, togglePlan, getApplicablePlans } = require("../controllers/subscription");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

// Create plan (SUPER_ADMIN only)
router.post("/", auth, authorize("SUPER_ADMIN"), createPlan);

// Get all active plans (public)
router.get("/", getPlans);

// Get applicable plans for specific event duration
router.get("/applicable", auth, getApplicablePlans);

// toggle plan active/inactive (SUPER_ADMIN only)
router.patch("/:planId/toggle", auth, authorize("SUPER_ADMIN"), togglePlan);

module.exports = router;





app.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("🔧 ENV CHECK:", {
  JWT_SECRET: !!process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  MONGO_URI: !!process.env.MONGO_URI,
  MAIL_USER: !!process.env.MAIL_USER
});

const authRouter = require("./routes/authrouter");
const passRouter = require("./routes/passrouter");
const adminRouter = require("./routes/adminrouter");
const hostRouter = require("./routes/hostrouter");
const placeRouter = require("./routes/placerouter");
const securityRouter = require("./routes/securityrouter");
const analyticsRouter = require("./routes/analyticsrouter");
const subscriptionRouter = require("./routes/subscriptionrouter");
const hostSubscriptionRouter = require("./routes/hostsubscription");
const publicRouter = require("./routes/publicrouter"); // ✅ ADDED

const seedSuperAdmin = require("./services/createadmin");

const app = express();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ADDED: Public routes (no authentication needed)
app.use("/api/public", publicRouter);

app.use("/api/auth", authRouter);
app.use("/api/passes", passRouter);
app.use("/api/admin", adminRouter);
app.use("/api/host", hostRouter);
app.use("/api/places", placeRouter);
app.use("/api/security", securityRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/host-subscription", hostSubscriptionRouter);

app.get("/", (req, res) => {
  res.json({ 
    message: "🎫 Visitor Pass Management System Running",
    version: "2.0",
    endpoints: {
      public: "/api/public",
      auth: "/api/auth",
      passes: "/api/passes",
      admin: "/api/admin",
      host: "/api/host",
      places: "/api/places",
      security: "/api/security",
      analytics: "/api/analytics",
      subscriptions: "/api/subscriptions",
      hostSubscription: "/api/host-subscription"
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.path 
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    
    await seedSuperAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });

module.exports = app;

