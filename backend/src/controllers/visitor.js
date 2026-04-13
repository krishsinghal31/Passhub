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

    // Prevent SUPER_ADMIN from creating bookings
    if (visitorId === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot create bookings. Please use a regular user account."
      });
    }

    const place = await Place.findById(placeId).populate("host");

    const placeStart = new Date(place.eventDates.start);
    const placeEnd = new Date(place.eventDates.end);
    placeStart.setHours(0, 0, 0, 0);
    placeEnd.setHours(0, 0, 0, 0);

    const accessMode = place.ticketAccessMode || "SELECT_DATE";

    const bookingVisitDateRaw = accessMode === "ALL_DAYS" ? placeStart : new Date(visitDate);
    const bookingVisitDate = new Date(bookingVisitDateRaw);
    bookingVisitDate.setHours(0, 0, 0, 0);

    if (accessMode !== "ALL_DAYS") {
      if (isNaN(bookingVisitDate.getTime())) {
        return res.status(400).json({ success: false, message: "Please select a valid visit date." });
      }
      if (bookingVisitDate < placeStart || bookingVisitDate > placeEnd) {
        return res.status(400).json({ success: false, message: "Visit date must be within event dates." });
      }
    }

    // For ALL_DAYS we generate ONE QR/pass per guest and validate the date range at scan time.
    // So we keep a single `passDate` (event start) for the Pass document.
    const passDate = bookingVisitDate;
    const perPassAmountPaid = place.price;

    const booking = await Booking.create({
      visitor: visitorId,
      place: placeId,
      visitDate: passDate,
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
        visitDate: passDate,
        ticketAccessMode: accessMode,
        guest: {
          name: guest.name,
          email: guest.email || null,
          phone: guest.phone || null
        },
        amountPaid: perPassAmountPaid,
        status: place.price === 0 ? "APPROVED" : "PENDING",
        paymentStatus: place.price === 0 ? "FREE" : "PENDING",
        qrActive: false,
        qrToken: null
      });
      passes.push(pass);
    }

    if (place.price === 0) {
      let emailFailures = 0;
      let emailAttempts = 0;
      const approvedCountNow = await Pass.countDocuments({
        place: placeId,
        visitDate: passDate,
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
  pass.slotNumber = approvedCountNow + i + 1;
  const qrImageBase64 = await generateQR({ passId: pass._id, qrToken });
  pass.qrImage = qrImageBase64;
  pass.qrToken = qrToken;
  pass.qrActive = true;
  await pass.save();

  if (pass.guest.email) {
    emailAttempts += 1;
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

    try {
      await sendPassEmail({
        to: pass.guest.email,
        subject: `Your Pass: ${place.name}`,
        html: passEmailTemplate({
          guest: pass.guest,
          place,
          visitDate: pass.visitDate,
          passes: [pass],
          isEmbedded: true
        }),
        attachments: attachments
      });
    } catch (emailErr) {
      emailFailures += 1;
      // Don't fail booking if a single email fails (e.g., SMTP auth issue).
      console.error(`❌ Guest email failed for ${pass.guest.email}:`, emailErr.message);
    }
  }
}

      booking.status = "CONFIRMED";
      booking.paymentStatus = "FREE";
      await booking.save();

      if (visitor && visitor.email) {
        emailAttempts += 1;
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
              visitDate: passDate,
              passes: passes 
            }),
            attachments: attachments
          });
          console.log(`✅ Summary Email sent to Visitor: ${visitor.email}`);
        } catch (emailError) {
          emailFailures += 1;
          console.error(`❌ Summary Email failed for ${visitor.email}:`, emailError.message);
        }
      }

      return res.json({
        success: true,
        message: emailFailures > 0
          ? `Booking confirmed. Passes generated. ${emailFailures}/${emailAttempts} email(s) failed.`
          : "Booking confirmed. Individual and summary emails sent.",
        emailStatus: {
          attempted: emailAttempts,
          failed: emailFailures
        },
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
      .populate("place", "name location image eventDates ticketAccessMode")
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    // Auto-expire approved passes whose visitDate is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const updates = [];

    for (const pass of passes) {
      if (pass.status !== "APPROVED") continue;

      if (pass.ticketAccessMode === "ALL_DAYS") {
        // Expire after the event end date (inclusive scan is handled at scan time).
        const end = pass.place?.eventDates?.end;
        if (!end) continue;
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < today) {
          pass.status = "EXPIRED";
          pass.qrActive = false;
          updates.push(pass.save());
        }
      } else if (pass.visitDate) {
        const v = new Date(pass.visitDate);
        v.setHours(0, 0, 0, 0);
        if (v < today) {
          pass.status = "EXPIRED";
          pass.qrActive = false;
          updates.push(pass.save());
        }
      }
    }
    if (updates.length) await Promise.allSettled(updates);

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