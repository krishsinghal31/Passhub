// backend/routes/admin.js - COMPLETE CORRECT VERSION
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const { adminAuth, superAdminAuth } = require("../middlewares/adminAuth");

// Existing routes...
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/passes", adminAuth, adminController.getAllPasses);
router.post("/invite-admin", superAdminAuth, adminController.inviteAdmin);
router.post("/admins/:adminId/disable", superAdminAuth, adminController.disableAdmin);
router.post("/users/:userId/disable", adminAuth, adminController.disableUser);
router.post("/users/:userId/toggle", adminAuth, adminController.toggleUserStatus);
router.get("/events/upcoming", adminAuth, adminController.getAllUpcomingEvents);
router.get("/hosts", adminAuth, adminController.getAllHosts);
router.post("/events/:eventId/cancel", adminAuth, adminController.cancelEventByAdmin);
router.get("/events/:eventId/details", adminAuth, adminController.getEventDetailsForAdmin);

// NEW routes for subscription plans and seats
router.post("/subscription-plans", superAdminAuth, adminController.createSubscriptionPlan);
router.get("/subscription-plans", superAdminAuth, adminController.getSubscriptionPlans);
router.patch("/subscription-plans/:planId/toggle", superAdminAuth, adminController.toggleSubscriptionPlan);
router.get("/events/:eventId/booked-seats", adminAuth, adminController.getBookedSeats);

module.exports = router;