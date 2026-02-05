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
    const passes = await Pass.find({ bookingId }).populate('place');

    // const passes = await Pass.find({ bookingId })
    //   .populate("bookedBy", "name email")
    //   .populate("place");

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
    const visitDate = passes[0].visitDate;

    const approvedCount = await Pass.countDocuments({
      place: place._id,
      visitDate,
      status: "APPROVED"
    });

    if (approvedCount + passes.length > place.dailyCapacity) {
      return res.status(400).json({ 
        success: false,
        message: "Capacity full. Please try a different date." 
      });
    }

    const passesWithQR = [];

    for (let i = 0; i < passes.length; i++) {
      const pass = passes[i];
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

      // Generate QR with SHORT data
      const qrImage = await generateQR({
        passId: pass._id.toString(),
        qrToken: qrToken
      });

      pass.qrImage = qrImage;
      await pass.save();

      passesWithQR.push(pass);

      if (pass.guest.email) {
        try {
          // Convert base64 QR image to attachment
          const attachments = [];
          if (pass.qrImage && pass.qrImage.startsWith('data:image')) {
            const base64Data = pass.qrImage.replace(/^data:image\/\w+;base64,/, '');
            attachments.push({
              filename: `qr-pass-${pass._id}.png`,
              content: base64Data,
              encoding: 'base64',
              cid: `qr-${pass._id}`
            });
          }
          
          await sendPassEmail({
            to: pass.guest.email,
            subject: `Your Pass for ${place.name}`,
            html: passEmailTemplate({
              guest: pass.guest,
              place,
              visitDate,
              passes: [pass] // Send only this guest's pass
            }),
            attachments: attachments
          });
          console.log(`✅ Pass email sent to: ${pass.guest.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${pass.guest.email}:`, emailError);
        }
      }
    }

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = "CONFIRMED";
      booking.paymentStatus = "PAID";
      await booking.save();
    }

    // ✅ FIXED: Send summary email to booker with ALL QR codes
    const visitorEmail = passes[0].bookedBy.email;
    if (visitorEmail) {
      try {
        // Convert all QR images to attachments
        const attachments = passesWithQR
          .filter(p => p.qrImage && p.qrImage.startsWith('data:image'))
          .map(pass => {
            const base64Data = pass.qrImage.replace(/^data:image\/\w+;base64,/, '');
            return {
              filename: `qr-pass-${pass._id}.png`,
              content: base64Data,
              encoding: 'base64',
              cid: `qr-${pass._id}`
            };
          });
        
        await sendPassEmail({
          to: visitorEmail,
          subject: `Payment Confirmed - ${place.name}`,
          html: passEmailTemplate({
            guest: passes[0].bookedBy,
            place,
            visitDate,
            passes: passesWithQR // Send all passes
          }),
          attachments: attachments
        });
        console.log(`✅ Summary email sent to: ${visitorEmail}`);
      } catch (emailError) {
        console.error(`❌ Failed to send summary email:`, emailError);
      }
    }

    res.json({
      success: true,
      message: "Payment confirmed. Passes generated and emailed.",
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