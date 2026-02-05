// backend/routes/hostrouter.js 
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/role");
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

//Update capacity route
router.patch("/places/:placeId/capacity", authMiddleware, isPlaceHost, hostController.updateCapacity);

//Toggle booking route
router.post("/places/:placeId/toggle-booking", authMiddleware, isPlaceHost, hostController.toggleBooking);

//Update event dates route
router.patch("/events/:eventId/dates", authMiddleware, hostController.updateEventDates);

// Update event details with notification
router.put("/places/:placeId/details-notify", authMiddleware, isPlaceHost, hostController.updateEventDetailsWithNotification);

// Cancel event by host
router.post("/places/:placeId/cancel", authMiddleware, isPlaceHost, hostController.cancelMyEvent);

// Security management
router.post("/assign-security", authMiddleware, hostController.assignSecurity);
router.delete("/places/:placeId/security/:securityId", authMiddleware, isPlaceHost, hostController.removeSecurity);

// ✅ NEW: Get security for place
router.get("/places/:placeId/security", authMiddleware, isPlaceHost, hostController.getSecurityForPlace);

// Slot management
router.get("/places/:placeId/slots", authMiddleware, isPlaceHost, hostController.getSlots);

// Manual override
router.post("/events/:eventId/manual-override", authMiddleware, hostController.manualOverride);

// Host analytics 
router.get("/events/:eventId/bookings-per-day", authMiddleware, hostAnalytics.getBookingsPerDay);
router.get("/events/:eventId/peak-checkin-hours", authMiddleware, hostAnalytics.getPeakCheckInHours);
router.get("/places/:placeId/analytics/security-activity", authMiddleware, isPlaceHost, hostAnalytics.getSecurityActivity);

module.exports = router;


// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middlewares/auth");
// const hostAnalytics = require("../controllers/hostanalytics");
// const hostController = require("../controllers/host");
// const hostingActive = require("../middlewares/hostingactive");
// const isPlaceHost = require("../middlewares/isplacehost");

// // Create place (requires active subscription)
// router.post("/place", authMiddleware, hostingActive, hostController.createPlace);

// // Get all hosted places/events
// router.get("/places", authMiddleware, hostController.getMyPlaces);
// router.get("/events", authMiddleware, hostController.getMyHostedEvents);

// // Place management
// router.get("/places/:placeId/dashboard", authMiddleware, isPlaceHost, hostController.getPlaceDashboard);
// router.put("/places/:placeId", authMiddleware, isPlaceHost, hostingActive, hostController.editPlace);
// router.patch("/places/:placeId/capacity", authMiddleware, isPlaceHost, hostController.updateCapacity);
// router.post("/places/:placeId/toggle-booking", authMiddleware, isPlaceHost, hostController.toggleBooking);

// router.patch("/events/:eventId/dates", authMiddleware, hostController.updateEventDates);

// // Security management
// router.post("/places/:placeId/invite-security", authMiddleware, isPlaceHost, hostController.inviteSecurity);
// router.delete("/places/:placeId/security/:securityId", authMiddleware, isPlaceHost, hostController.removeSecurity);

// // Slot management
// router.get("/places/:placeId/slots", authMiddleware, isPlaceHost, hostController.getSlots);
// router.get('/places/:placeId/security', authMiddleware, hostController.getSecurityForPlace);
// router.post("/events/:eventId/manual-override", authMiddleware, hostController.manualOverride);
// router.post("/places/:placeId/cancel",isPlaceHost, hostController.cancelMyEvent);
// router.put('/places/:placeId/details-notify', authMiddleware, hostController.updateEventDetailsWithNotification);

// // Host analytics 
// router.get("/events/:eventId/bookings-per-day", authMiddleware, hostAnalytics.getBookingsPerDay);
// router.get("/events/:eventId/peak-checkin-hours", authMiddleware, hostAnalytics.getPeakCheckInHours);
// router.get("/places/:placeId/analytics/security-activity", authMiddleware, isPlaceHost, hostAnalytics.getSecurityActivity);

// module.exports = router;