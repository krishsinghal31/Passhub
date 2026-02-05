// backend/src/controllers/visitor.js
const Pass = require("../models/pass");
const Booking = require("../models/booking");
const Place = require("../models/place");
const mongoose = require("mongoose");
const { generateQR } = require("../services/qr");
const crypto = require("crypto");
const { sendPassEmail } = require("../services/email");
const { passEmailTemplate } = require("../templates/passEmail");

exports.createBooking = async (req, res) => {
  try {
    const { placeId, visitDate, guests } = req.body;
    const visitorId = req.user.id;

    // Prevent SUPER_ADMIN from creating bookings (they don't have a real user ID)
    if (visitorId === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot create bookings. Please use a regular user account."
      });
    }

    const place = await Place.findById(placeId).populate("host");

    const vDate = new Date(visitDate);
    vDate.setHours(0, 0, 0, 0);

    const booking = await Booking.create({
      visitor: visitorId,
      place: placeId,
      visitDate: vDate,
      guestCount: guests.length,
      totalAmount: place.price * guests.length,
      status: "PENDING",
      paymentStatus: place.price === 0 ? "FREE" : "PENDING"
    });

    const passes = [];
    const User = require("../models/user");
    const visitor = await User.findById(visitorId).select("name email");

    for (const guest of guests) {
      const pass = await Pass.create({
        bookingId: booking._id,
        bookedBy: visitorId,
        host: place.host._id,
        place: placeId,
        visitDate: vDate,
        guest: {
          name: guest.name,
          email: guest.email || null,
          phone: guest.phone || null
        },
        amountPaid: place.price,
        status: place.price === 0 ? "APPROVED" : "PENDING",
        paymentStatus: place.price === 0 ? "FREE" : "PENDING",
        qrActive: false,
        qrToken: null
      });
      passes.push(pass);
    }

    if (place.price === 0) {
      const approvedCountNow = await Pass.countDocuments({
        place: placeId,
        visitDate: vDate,
        status: "APPROVED"
      });

      let index = 0;
      // for (const pass of passes) {
      //   const qrToken = crypto.randomUUID();

      //   pass.status = "APPROVED";
      //   pass.paymentStatus = "FREE";
      //   pass.slotNumber = approvedCountNow + index + 1;
      //   pass.qrToken = qrToken;
      //   pass.qrActive = true;

      //   pass.qrImage = await generateQR({
      //     passId: pass._id.toString(),
      //     bookingId: pass.bookingId.toString(),
      //     qrToken,
      //     guest: pass.guest.name,
      //     place: place.name,
      //     visitDate: vDate.toISOString()
      //   });

      //   await pass.save();

      //   if (pass.guest.email) {
      //     try {
      //       await sendPassEmail({
      //         to: pass.guest.email,
      //         subject: `Your Free Pass: ${place.name}`,
      //         html: passEmailTemplate({
      //           guest: pass.guest,
      //           place,
      //           visitDate: vDate,
      //           passes: [pass] 
      //         })
      //       });
      //       console.log(`✅ Guest Email [${index + 1}/${passes.length}] sent to: ${pass.guest.email}`);
      //     } catch (emailError) {
      //       console.error(`❌ Guest Email failed for ${pass.guest.email}:`, emailError.message);
      //     }
      //   }
      //   index++;
      // }
 
for (let i = 0; i < passes.length; i++) {
  const pass = passes[i];
  
  const qrToken = crypto.randomUUID();
  const qrImageBase64 = await generateQR({ passId: pass._id, qrToken });
  pass.qrImage = qrImageBase64;
  await pass.save();

  if (pass.guest.email) {
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
      subject: `Your Pass: ${place.name}`,
      html: passEmailTemplate({
        guest: pass.guest,
        place,
        visitDate: vDate,
        passes: [pass],
        isEmbedded: true 
      }),
      attachments: attachments
    });
  }
}

      booking.status = "CONFIRMED";
      booking.paymentStatus = "FREE";
      await booking.save();

      if (visitor && visitor.email) {
        try {
          // Convert all QR images to attachments
          const attachments = passes
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
            to: visitor.email,
            subject: `Booking Confirmed - ${place.name}`,
            html: passEmailTemplate({
              guest: { name: visitor.name, email: visitor.email },
              place,
              visitDate: vDate,
              passes: passes 
            }),
            attachments: attachments
          });
          console.log(`✅ Summary Email sent to Visitor: ${visitor.email}`);
        } catch (emailError) {
          console.error(`❌ Summary Email failed for ${visitor.email}:`, emailError.message);
        }
      }

      return res.json({
        success: true,
        message: "Booking confirmed! Individual and summary emails sent.",
        bookingId: booking._id,
        passes: passes.map(p => ({
          passId: p._id,
          guest: p.guest.name,
          qrImage: p.qrImage
        }))
      });
    }

    if (visitor && visitor.email) {
      try {
        await sendPassEmail({
          to: visitor.email,
          subject: `Payment Pending: ${place.name}`,
          html: pendingEmailTemplate
        });
      } catch (err) {
        console.error("❌ Pending Payment Email failed:", err.message);
      }
    }

    res.json({
      success: true,
      message: "Booking created. Please complete payment.",
      bookingId: booking._id,
      amountToPay: booking.totalAmount
    });

  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPasses = async (req, res) => {
  try {
    const passes = await Pass.find({ bookedBy: req.user.id })
      .populate("place", "name location image")
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      count: passes.length,
      passes 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAllBookingsByVisitor = async (req, res) => {
  try {
    const bookings = await Booking.find({ visitor: req.user.id })
      .populate("place", "name location image price")
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      bookings.map(async booking => {
        const passes = await Pass.find({ bookingId: booking._id })
          .select("guest status slotNumber qrImage");

        return {
          ...booking.toObject(),
          passes
        };
      })
    );

    res.json({ 
      success: true,
      count: enriched.length,
      bookings: enriched 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// exports.getBookingDetails = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId)
//       .populate("place")
//       .populate("visitor", "name email");

//     if (!booking) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Booking not found" 
//       });
//     }

//     if (booking.visitor._id.toString() !== req.user.id) {
//       return res.status(403).json({ 
//         success: false,
//         message: "Not authorized" 
//       });
//     }

//     const passes = await Pass.find({ bookingId });

//     res.json({ 
//       success: true,
//       booking: {
//         ...booking.toObject(),
//         passes
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       message: error.message 
//     });
//   }
// };

// backend/controllers/visitor.js - UPDATED getBookingDetails

// backend/controllers/visitor.js - FINAL SYNCED VERSION

exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const requesterId = req.user.id || req.user._id; 
    const requesterRole = req.user.role;

    const booking = await Booking.findById(bookingId)
      .populate("place")
      .populate("visitor", "name email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isOwner = booking.visitor._id.toString() === requesterId.toString();
    const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access to this booking" 
      });
    }

    const passes = await Pass.find({ bookingId: booking._id });

    res.json({ 
      success: true, 
      booking: {
        ...booking.toObject(),
        passes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};