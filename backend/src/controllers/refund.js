// backend/src/controllers/refund.js
const Pass = require("../models/pass");
const Booking = require("../models/booking");
const { calculateRefundAmount } = require("../utils/refundpolicy");
const { refundInitiatedMail, refundCompletedMail } = require("../services/refundmail");

exports.initiateRefund = async (req, res) => {
  try {
    const { bookingId } = req.params; 
    const { reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId).populate("visitor", "name email");

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    if (booking.visitor._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const passes = await Pass.find({ bookingId })
      .populate("place")
      .populate("bookedBy");

    if (!passes.length) {
      return res.status(404).json({ 
        success: false,
        message: "No passes found for this booking" 
      });
    }

    let totalRefund = 0;
    const refundedPasses = [];

    for (const pass of passes) {
      if (pass.paymentStatus !== "PAID") {
        continue;
      }

      if (pass.refundStatus !== "NONE" && pass.refundStatus !== "INITIATED") {
        continue;
      }

      const refundAmount = calculateRefundAmount(pass, pass.place);
      totalRefund += refundAmount;

      pass.refundStatus = refundAmount > 0 ? "INITIATED" : "NONE";
      pass.refundAmount = refundAmount;
      pass.paymentStatus = refundAmount > 0 ? "REFUNDED" : pass.paymentStatus;

      await pass.save();
      refundedPasses.push({
        guestName: pass.guest.name,
        placeName: pass.place.name,
        visitDate: pass.visitDate,
        slotNumber: pass.slotNumber,
        refundAmount: pass.refundAmount
      });
    }

    if (totalRefund === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No refundable passes found" 
      });
    }

    booking.refundStatus = "INITIATED";
    booking.refundAmount = totalRefund;
    await booking.save();

    await refundInitiatedMail(
      booking.visitor.email, 
      bookingId, 
      totalRefund, 
      refundedPasses
    );

    res.json({
      success: true,
      message: "Refund initiated successfully",
      refund: {
        _id: `refund_${bookingId}`,
        bookingId,
        amount: totalRefund,
        status: "processing",
        estimatedDays: "5-7 business days",
        method: "original_payment_method"
      },
      totalRefund,
      refundedPasses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};