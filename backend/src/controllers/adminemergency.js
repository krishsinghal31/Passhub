// backend/src/controllers/adminemergency.js
const User = require("../models/user");
const Place = require("../models/place");
const AdminActionLog = require("../models/adminactionlog");

const { cancelFuturePasses } = require("../utils/adminemergencyhelper");
const {
  sendHostDisabledMail,
  sendEventCancelledMail
} = require("../services/admincancelmail");

exports.disableHost = async (req, res) => {
  try {
    const { hostId } = req.params;
    const { reason } = req.body;

    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ 
        success: false,
        message: "Host not found" 
      });
    }

    host.isHostingDisabled = true;
    await host.save();

    const places = await Place.find({ host: hostId });

    for (const place of places) {
      place.isBookingEnabled = false;
      place.hostingValidity.end = new Date();
      await place.save();

      await cancelFuturePasses({
        filter: {
          place: place._id,
          visitDate: { $gte: new Date() },
          status: { $ne: "CANCELLED" }
        },
        reason,
        cancelledBy: req.user.id
      });
    }

    await sendHostDisabledMail({ to: host.email, reason });

    await AdminActionLog.create({
      admin: req.user.id,
      action: "DISABLE_HOST",
      targetId: hostId,
      reason
    });

    res.json({ 
      success: true,
      message: "Host disabled and bookings cancelled" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { reason, refundAll } = req.body;
    const adminId = req.user.id;

    const place = await Place.findById(placeId).populate("host", "name email");

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    const activePasses = await Pass.find({ 
      place: placeId,
      status: { $in: ["APPROVED", "PENDING"] },
      paymentStatus: "PAID"
    }).populate("bookedBy", "name email")
      .populate("bookingId");

    let totalRefundAmount = 0;
    const affectedVisitors = new Set();
    const refundedPasses = [];
    const affectedBookings = new Map();

    // Process all passes for 100% refund
    for (const pass of activePasses) {
      // Calculate 100% refund (ignore refund policy for event cancellation)
      const refundAmount = pass.price || 0;
      totalRefundAmount += refundAmount;

      // Update pass
      pass.status = "CANCELLED";
      pass.refundStatus = "INITIATED";
      pass.refundAmount = refundAmount;
      pass.refundPercentage = 100;
      pass.cancelledAt = new Date();
      pass.cancellationReason = `Event cancelled by admin: ${reason}`;
      pass.cancelledBy = "ADMIN";
      pass.cancelledByUserId = adminId;
      await pass.save();

      // Track affected visitors
      affectedVisitors.add(pass.bookedBy._id.toString());

      refundedPasses.push({
        passId: pass._id,
        guestName: pass.guest.name,
        email: pass.guest.email,
        refundAmount,
        visitDate: pass.visitDate
      });

      // Aggregate refunds by booking
      const bookingId = pass.bookingId._id.toString();
      if (!affectedBookings.has(bookingId)) {
        affectedBookings.set(bookingId, {
          booking: pass.bookingId,
          refundAmount: 0,
          passes: []
        });
      }
      const bookingData = affectedBookings.get(bookingId);
      bookingData.refundAmount += refundAmount;
      bookingData.passes.push(pass);
    }

    // Update all affected bookings
    for (const [bookingId, data] of affectedBookings) {
      const booking = data.booking;
      booking.status = "CANCELLED";
      booking.refundStatus = "FULL";
      booking.refundAmount = data.refundAmount;
      booking.cancelledAt = new Date();
      booking.cancellationReason = `Event cancelled: ${reason}`;
      await booking.save();

      // Send individual refund emails to each visitor
      await eventCancellationRefundMail(
        booking.visitor.email,
        {
          bookingId: booking._id,
          placeName: place.name,
          reason,
          refundAmount: data.refundAmount,
          passes: data.passes.map(p => ({
            guestName: p.guest.name,
            visitDate: p.visitDate,
            refundAmount: p.refundAmount
          }))
        }
      );
    }

    // Update place/event status
    place.status = "CANCELLED";
    place.bookingEnabled = false;
    place.cancelledAt = new Date();
    place.cancellationReason = reason;
    place.cancelledBy = "ADMIN";
    await place.save();

    // Notify host about event cancellation
    await hostEventCancelledMail(
      place.host.email,
      {
        placeName: place.name,
        reason,
        totalRefunds: totalRefundAmount,
        affectedVisitors: affectedVisitors.size,
        cancelledBy: "Admin",
        date: new Date()
      }
    );

    // Create admin activity log
    await AdminActionLog.create({
      admin: adminId,
      action: "EVENT_CANCELLED",
      targetType: "Place",
      targetId: placeId,
      details: {
        reason,
        totalRefunds: totalRefundAmount,
        affectedPasses: activePasses.length,
        affectedVisitors: affectedVisitors.size
      }
    });

    res.json({
      success: true,
      message: "Event cancelled successfully. All visitors will be refunded 100%.",
      data: {
        placeId,
        placeName: place.name,
        status: "CANCELLED",
        cancelledAt: place.cancelledAt,
        reason,
        impact: {
          totalPasses: activePasses.length,
          affectedVisitors: affectedVisitors.size,
          affectedBookings: affectedBookings.size,
          totalRefundAmount,
          refundPercentage: 100,
          estimatedProcessingTime: "3-5 business days"
        },
        notifications: {
          visitorEmailsSent: affectedBookings.size,
          hostNotified: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
