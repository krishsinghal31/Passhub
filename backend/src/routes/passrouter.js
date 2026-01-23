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
router.patch("/:passId/cancel", authMiddleware, passController.cancelGuestPass);
router.patch("/cancel-bulk", authMiddleware, passController.cancelMultiplePasses);

// Payment
router.post("/payments/confirm", authMiddleware, paymentController.confirmPayment);

// Refund
router.post("/refund/initiate", authMiddleware, refundController.initiateRefund);

module.exports = router;
