// controllers/pass.js
const Pass = require("../models/pass");
const Booking = require("../models/booking");
const mongoose = require("mongoose");
const { sendCancellationEmail } = require("../services/email");

const cancelGuestPass = async (req, res) => {
  try {
    const { passId } = req.params;
    const visitorId = req.user.id;
    const { reason } = req.body || {}; 

    const pass = await Pass.findById(passId).populate("place").populate("bookedBy", "name email");

    if (!pass) {
      return res.status(404).json({ 
        success: false,
        message: "Pass not found" 
      });
    }

    if (pass.bookedBy._id.toString() !== visitorId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }

    if (pass.status === "CANCELLED") {
      return res.status(400).json({ 
        success: false,
        message: "Pass already cancelled" 
      });
    }

    if (pass.checkInTime) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot cancel after check-in" 
      });
    }

    pass.status = "CANCELLED";
    pass.qrActive = false;
    pass.cancelledAt = new Date();
    pass.cancellationReason = reason || "Cancelled by visitor";
    
    await pass.save();

    const { calculateRefundAmount } = require("../utils/refundpolicy");
    const refundAmount = calculateRefundAmount(pass, pass.place);

    if (refundAmount > 0 && pass.paymentStatus === "PAID") {
      pass.refundAmount = refundAmount;
      pass.refundStatus = "INITIATED";
      pass.paymentStatus = "REFUNDED";
      await pass.save();
    }

    // Send cancellation email to guest
    if (pass.guest && pass.guest.email) {
      await sendCancellationEmail({
        to: pass.guest.email,
        subject: `Pass Cancelled - ${pass.place.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Pass Cancelled</h2>
            <p>Dear ${pass.guest.name},</p>
            <p>Your pass for <strong>${pass.place.name}</strong> on <strong>${new Date(pass.visitDate).toDateString()}</strong> has been cancelled.</p>
            
            ${refundAmount > 0 ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${refundAmount}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">The refund will be processed within 3-5 business days.</p>
              </div>
            ` : `
              <p style="color: #dc2626;">No refund applicable as per the cancellation policy.</p>
            `}
            
            <p><strong>Reason:</strong> ${pass.cancellationReason}</p>
            
            <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
          </div>
        `,
        type: 'visitor'
      });
    }

    // Send notification to booker if different from guest
    if (pass.bookedBy.email && pass.bookedBy.email !== (pass.guest ? pass.guest.email : '')) {
      await sendCancellationEmail({
        to: pass.bookedBy.email,
        subject: `Pass Cancelled - ${pass.place.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Pass Cancelled</h2>
            <p>Dear ${pass.bookedBy.name},</p>
            <p>A pass you booked for <strong>${pass.guest ? pass.guest.name : 'Guest'}</strong> at <strong>${pass.place.name}</strong> on <strong>${new Date(pass.visitDate).toDateString()}</strong> has been cancelled.</p>
            
            ${refundAmount > 0 ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${refundAmount}</p>
              </div>
            ` : ''}
            
            <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
          </div>
        `,
        type: 'visitor'
      });
    }

    res.json({ 
      success: true,
      message: "Pass cancelled successfully",
      pass,
      refundAmount 
    });
  } catch (error) {
    console.error("Error cancelling pass:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const cancelMultiplePasses = async (req, res) => {
  try {
    const { passIds, reason } = req.body || {}; 
    const visitorId = req.user.id;

    if (!passIds || !passIds.length) {
      return res.status(400).json({ 
        success: false,
        message: "Pass IDs required" 
      });
    }

    const passes = await Pass.find({ 
      _id: { $in: passIds } 
    }).populate("place").populate("bookedBy", "name email");

    if (!passes.length) {
      return res.status(404).json({ 
        success: false,
        message: "Passes not found" 
      });
    }

    const bookingId = passes[0].bookingId ? passes[0].bookingId.toString() : null;
    const sameBooking = passes.every(p => p.bookingId && p.bookingId.toString() === bookingId);
    
    if (!sameBooking) {
      return res.status(400).json({ 
        success: false,
        message: "All passes must be from the same booking" 
      });
    }

    let totalRefund = 0;
    const { calculateRefundAmount } = require("../utils/refundpolicy");
    const cancelledPasses = [];

    for (const pass of passes) {
      if (pass.bookedBy._id.toString() !== visitorId) {
        return res.status(403).json({ 
          success: false,
          message: "Not authorized" 
        });
      }

      if (pass.status === "CANCELLED") continue;

      pass.status = "CANCELLED";
      pass.qrActive = false;
      pass.cancelledAt = new Date();
      pass.cancellationReason = reason || "Bulk cancellation";

      const refundAmount = calculateRefundAmount(pass, pass.place);
      
      if (refundAmount > 0 && pass.paymentStatus === "PAID") {
        pass.refundAmount = refundAmount;
        pass.refundStatus = "INITIATED";
        pass.paymentStatus = "REFUNDED";
        totalRefund += refundAmount;
      }

      await pass.save();
      cancelledPasses.push(pass);

      // Send individual cancellation emails
      if (pass.guest && pass.guest.email) {
        await sendCancellationEmail({
          to: pass.guest.email,
          subject: `Pass Cancelled - ${pass.place.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc2626;">Pass Cancelled</h2>
              <p>Dear ${pass.guest.name},</p>
              <p>Your pass for <strong>${pass.place.name}</strong> on <strong>${new Date(pass.visitDate).toDateString()}</strong> has been cancelled.</p>
              
              ${pass.refundAmount > 0 ? `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Refund Amount:</strong> ₹${pass.refundAmount}</p>
                </div>
              ` : ''}
              
              <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
            </div>
          `,
          type: 'visitor'
        });
      }
    }

    // Send summary email to booker
    const bookerEmail = passes[0].bookedBy.email;
    if (bookerEmail) {
      const passDetails = cancelledPasses
        .map(p => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">${p.guest ? p.guest.name : 'N/A'}</td>
            <td style="padding: 10px;">${p.place.name}</td>
            <td style="padding: 10px;">${new Date(p.visitDate).toDateString()}</td>
            <td style="padding: 10px;">₹${p.refundAmount || 0}</td>
          </tr>
        `)
        .join("");

      await sendCancellationEmail({
        to: bookerEmail,
        subject: `Bulk Cancellation - ${cancelledPasses.length} Passes Cancelled`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Bulk Pass Cancellation</h2>
            <p>Dear ${passes[0].bookedBy.name},</p>
            <p><strong>${cancelledPasses.length}</strong> passes have been cancelled.</p>
            
            <h3>Cancelled Passes:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Guest</th>
                  <th style="padding: 10px; text-align: left;">Place</th>
                  <th style="padding: 10px; text-align: left;">Date</th>
                  <th style="padding: 10px; text-align: left;">Refund</th>
                </tr>
              </thead>
              <tbody>
                ${passDetails}
              </tbody>
            </table>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Total Refund Amount:</strong> ₹${totalRefund}</p>
              ${totalRefund > 0 ? '<p style="margin: 5px 0 0 0; font-size: 14px;">Refunds will be processed within 3-5 business days.</p>' : ''}
            </div>
            
            <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
          </div>
        `,
        type: 'visitor'
      });
    }

    res.json({ 
      success: true,
      message: "Passes cancelled successfully",
      cancelledCount: cancelledPasses.length,
      totalRefund 
    });
  } catch (error) {
    console.error("Error in bulk cancellation:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  cancelGuestPass,
  cancelMultiplePasses
};