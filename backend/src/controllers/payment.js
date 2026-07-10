// controllers/payment.js
const Pass = require("../models/pass");
const Booking = require("../models/booking");
const Place = require("../models/place");
const crypto = require("crypto");
const { generateQR } = require("../services/qr");
const { sendPassEmail } = require("../services/email");
const { passEmailTemplate } = require("../templates/passEmail");

exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;
    const passes = await Pass.find({ bookingId })
      .populate('place')
      .populate('bookedBy', 'name email');

    if (!passes.length) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    if (passes[0].bookedBy._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }

    if (passes[0].paymentStatus === "PAID") {
      return res.status(400).json({ 
        success: false,
        message: "Payment already completed" 
      });
    }

    const place = passes[0].place;

    // Support multi-day (ALL_DAYS) bookings by capacity-checking per `visitDate`
    // and assigning slot numbers per day.
    const groupedByDate = passes.reduce((acc, pass) => {
      const d = new Date(pass.visitDate);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(pass);
      return acc;
    }, {});

    const passesWithQR = [];
    let emailFailures = 0;
    let emailAttempts = 0;

    for (const dateKey of Object.keys(groupedByDate)) {
      const group = groupedByDate[dateKey];
      const groupVisitDate = new Date(group[0].visitDate);
      groupVisitDate.setHours(0, 0, 0, 0);

      const approvedCount = await Pass.countDocuments({
        place: place._id,
        visitDate: groupVisitDate,
        status: "APPROVED"
      });

      if (approvedCount + group.length > place.dailyCapacity) {
        return res.status(400).json({
          success: false,
          message: "Capacity full for one of the selected dates."
        });
      }

      for (let i = 0; i < group.length; i++) {
        const pass = group[i];
        const qrToken = crypto.randomUUID();

        pass.status = "APPROVED";
        pass.paymentStatus = "PAID";
        pass.slotNumber = approvedCount + i + 1;
        pass.qrToken = qrToken;
        pass.qrActive = true;

        pass.refundSnapshot = {
          isRefundable: place.refundPolicy.isRefundable,
          beforeVisitPercent: place.refundPolicy.beforeVisitPercent,
          sameDayPercent: place.refundPolicy.sameDayPercent,
          description: place.refundPolicy.description
        };

        // Generate QR with short data: passId|qrToken
        const qrImage = await generateQR({
          passId: pass._id.toString(),
          qrToken: qrToken
        });

        pass.qrImage = qrImage;
        await pass.save();

        passesWithQR.push(pass);

        // Individual guest emails disabled. Only consolidated summary email is sent to the booker.
      }
    }

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = "CONFIRMED";
      booking.paymentStatus = "PAID";
      await booking.save();
    }

    res.json({
      success: true,
      message: "Payment confirmed. Passes generated.",
      bookingId,
      passes: passesWithQR.map(p => ({
        passId: p._id,
        guest: p.guest.name,
        slotNumber: p.slotNumber,
        qrImage: p.qrImage
      }))
    });
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};