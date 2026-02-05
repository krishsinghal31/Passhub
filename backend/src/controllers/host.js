// backend/src/controllers/host.js
const Place = require("../models/place");
const Pass = require("../models/pass");
const Security = require("../models/security");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendSecurityCredentials,sendPassEmail } = require("../services/email");
const { isHostingActive } = require("../utils/hostingvalidity");

exports.createPlace = async (req, res) => {
  try {
    console.log('🔍 User ID:', req.user.id);
    
    const person = await User.findById(req.user.id);
    console.log('🔍 User subscription:', JSON.stringify(person.subscription, null, 2));

    const {
      name,
      location,
      image,
      eventDates,
      price,
      dailyCapacity,
      refundPolicy
    } = req.body;

    const hostId = req.user.id;
    const host = await User.findById(hostId);

    if (!host.subscription || !host.subscription.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Active subscription required" 
      });
    }

    const subStart = new Date(host.subscription.startDate);
    const subEnd = new Date(host.subscription.endDate);
    
    const eventStart = new Date(eventDates.start);
    const eventEnd = new Date(eventDates.end);

    if (eventStart < subStart || eventEnd > subEnd) {
      return res.status(400).json({ 
        success: false,
        message: "Event dates must be within subscription period" 
      });
    }

    const place = await Place.create({
      name,
      location,
      image,
      host: hostId,
      eventDates: {
        start: eventStart,
        end: eventEnd
      },
      hostingValidity: {
        start: subStart,
        end: subEnd
      },
      price,
      dailyCapacity,
      refundPolicy: {
        isRefundable: refundPolicy?.isRefundable || true,
        beforeVisitPercent: refundPolicy?.beforeVisitPercent || 80,
        sameDayPercent: refundPolicy?.sameDayPercent || 50,
        description: refundPolicy?.description || "Standard refund policy"
      },
      isBookingEnabled: true
    });

    res.status(201).json({ 
      success: true,
      message: "Place created successfully",
      place 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getMyPlaces = async (req, res) => {
  try {
    const places = await Place.find({ host: req.user.id })
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      places.map(async place => {
        const bookingsCount = await Pass.countDocuments({
          place: place._id,
          status: "APPROVED"
        });

        return {
          ...place.toObject(),
          totalBookings: bookingsCount,
          isActive: isHostingActive(place)
        };
      })
    );

    res.json({ 
      success: true,
      count: enriched.length,
      places: enriched 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getMyHostedEvents = async (req, res) => {
  try {
    const { status, placeId } = req.query;
    
    let query = { host: req.user.id };
    if (placeId) query._id = placeId;
    
    const places = await Place.find(query).sort({ "eventDates.start": -1 });
    
    const events = places.filter(place => {
      const now = new Date();
      const eventEnd = new Date(place.eventDates.end);
      
      if (status === 'upcoming') {
        return eventEnd >= now;
      } else if (status === 'completed') {
        return eventEnd < now;
      }
      return true;
    });
    
    const enriched = await Promise.all(
      events.map(async place => {
        const totalBookings = await Pass.countDocuments({
          place: place._id,
          status: "APPROVED"
        });
        
        const totalRevenue = await Pass.aggregate([
          { $match: { place: place._id, paymentStatus: "PAID" } },
          { $group: { _id: null, total: { $sum: "$amountPaid" } } }
        ]);

        return {
          _id: place._id,
          title: place.name,
          place: {
            _id: place._id,
            name: place.name,
            location: place.location
          },
          date: place.eventDates.start,
          endDate: place.eventDates.end,
          bookings: totalBookings,
          capacity: place.dailyCapacity,
          status: new Date(place.eventDates.end) >= new Date() ? 'upcoming' : 'completed',
          revenue: totalRevenue[0]?.total || 0,
          isBookingEnabled: place.isBookingEnabled
        };
      })
    );
    
    res.json({ 
      success: true,
      events: enriched,
      summary: {
        total: enriched.length,
        upcoming: enriched.filter(e => e.status === 'upcoming').length,
        completed: enriched.filter(e => e.status === 'completed').length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getPlaceDashboard = async (req, res) => {
  try {
    const { placeId } = req.params;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    const totalPasses = await Pass.countDocuments({ place: placeId });
    const approvedPasses = await Pass.countDocuments({ 
      place: placeId, 
      status: "APPROVED" 
    });
    const cancelledPasses = await Pass.countDocuments({ 
      place: placeId, 
      status: "CANCELLED" 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPasses = await Pass.countDocuments({
      place: placeId,
      visitDate: today,
      status: "APPROVED"
    });

    const checkedIn = await Pass.countDocuments({
      place: placeId,
      visitDate: today,
      checkInTime: { $ne: null }
    });

    const security = await Security.find({ 
      place: placeId, 
      isActive: true 
    });
    
    const totalRevenue = await Pass.aggregate([
      { $match: { place: place._id, paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

    res.json({
      success: true,
      dashboard: {
        place: {
          _id: place._id,
          name: place.name,
          location: place.location,
          capacity: place.dailyCapacity,
          price: place.price,
          isBookingEnabled: place.isBookingEnabled
        },
        stats: {
          totalPasses,
          approvedPasses,
          cancelledPasses,
          todayPasses,
          checkedIn,
          remainingCapacity: place.dailyCapacity - todayPasses,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        security: security.length,
        eventDates: place.eventDates,
        hostingValidity: place.hostingValidity
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.editPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const place = await Place.findById(placeId);

    if (!place) return res.status(404).json({ success: false, message: "Not found" });

    // CRITICAL SECURITY CHECK
    const isExpired = new Date(place.eventDates.end) < new Date();
    const isCancelled = place.status === 'CANCELLED';

    if (isExpired || isCancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Updates are not allowed for completed or cancelled events." 
      });
    }

    // ... proceed with update ...
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCapacity = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { dailyCapacity } = req.body;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    const oldCapacity = place.dailyCapacity;
    place.dailyCapacity = dailyCapacity;
    await place.save();
    
    const affectedEvents = await Pass.aggregate([
      { $match: { place: place._id, status: "APPROVED" } },
      { $group: { _id: "$visitDate", count: { $sum: 1 } } }
    ]);

    res.json({ 
      success: true,
      message: "Capacity updated",
      place: {
        _id: place._id,
        capacity: place.dailyCapacity,
        affectedEvents: affectedEvents.map(e => ({
          date: e._id,
          oldLimit: oldCapacity,
          newLimit: dailyCapacity,
          additionalSeats: dailyCapacity - oldCapacity,
          currentBookings: e.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.toggleBooking = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { reason } = req.body;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    place.isBookingEnabled = !place.isBookingEnabled;
    if (!place.isBookingEnabled && reason) {
      place.disabledReason = reason;
    }
    await place.save();
    
    const futureBookingsCount = await Pass.countDocuments({
      place: placeId,
      visitDate: { $gte: new Date() },
      status: "APPROVED"
    });

    res.json({ 
      success: true,
      message: `Booking ${place.isBookingEnabled ? 'enabled' : 'disabled'}`,
      place: {
        _id: place._id,
        bookingEnabled: place.isBookingEnabled,
        disabledReason: place.disabledReason
      },
      affectedEvents: futureBookingsCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateEventDates = async (req, res) => {
  try {
    const { eventId } = req.params; // Changed from placeId
    const { date, startTime, endTime } = req.body;

    const place = await Place.findById(eventId).populate("host");

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    if (place.host._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }

    const newStartDate = date ? new Date(date) : new Date(place.eventDates.start);
    const newEndDate = date ? new Date(date) : new Date(place.eventDates.end);

    const host = await User.findById(place.host);
    const subEnd = new Date(host.subscription.endDate);

    if (newEndDate > subEnd) {
      return res.status(400).json({ 
        success: false,
        message: "Event end date exceeds subscription validity" 
      });
    }

    place.eventDates.start = newStartDate;
    place.eventDates.end = newEndDate;
    await place.save();
    
    const affectedBookings = await Pass.countDocuments({
      place: place._id,
      status: "APPROVED"
    });

    res.json({ 
      success: true,
      message: "Event dates updated",
      event: {
        _id: place._id,
        title: place.name,
        date: place.eventDates.start,
        startTime: startTime || "10:00",
        endTime: endTime || "18:00"
      },
      notification: `All ${affectedBookings} attendees have been notified`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// exports.inviteSecurity = async (req, res) => {
//   try {
//     const { placeId } = req.params;
//     const { email, startDate, endDate } = req.body; 

//     if (!startDate || !endDate) {
//       return res.status(400).json({ success: false, message: "Assignment dates are required" });
//     }

//     const place = await Place.findById(placeId);
//     if (!place) {
//       return res.status(404).json({ success: false, message: "Place not found" });
//     }

//     const existing = await Security.findOne({ 
//       email: email.toLowerCase(), 
//       place: placeId 
//     });
    
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Security already assigned to this place" });
//     }

//     const tempPassword = Math.floor(1000000000 + Math.random() * 9000000000).toString();
//     const passwordHash = await bcrypt.hash(tempPassword, 10);

//     const security = await Security.create({
//       email: email.toLowerCase(),
//       passwordHash,
//       place: placeId,
//       assignedBy: req.user.id,
//       assignmentPeriod: {
//         start: new Date(startDate), 
//         end: new Date(endDate)     
//       },
//       status: "PENDING",
//       isActive: true
//     });

//     await sendSecurityCredentials({
//       to: email,
//       password: tempPassword,
//       placeName: place.name,
//       placeId: placeId
//     });

//     res.json({
//       success: true,
//       message: "Security assigned with custom duration",
//       security: {
//         id: security._id,
//         email: security.email,
//         status: security.status,
//         period: security.assignmentPeriod
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.assignSecurity = async (req, res) => {
  try {
    const { email, name, placeId, assignmentPeriod } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ success: false, message: "Place not found" });

    let user = await User.findOne({ email: normalizedEmail });
    let tempPassword = null;
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      user = await User.create({
        name: name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'VISITOR', 
        status: 'PENDING'
      });
    }

    await Security.create({
      user: user._id,
      email: normalizedEmail,
      place: placeId,
      assignedBy: req.user.id, 
      passwordHash: user.password, 
      assignmentPeriod: {
        start: new Date(assignmentPeriod.start),
        end: new Date(assignmentPeriod.end)
      },
      status: 'ACCEPTED',
      isActive: true
    });

    if (isNewUser) {
      await sendSecurityCredentials({
        to: normalizedEmail,
        password: tempPassword,
        placeName: place.name
      });
    } else {
      await sendPassEmail({
        to: normalizedEmail,
        subject: `New Staff Assignment: ${place.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #4f46e5;">New Assignment Received</h2>
            <p>Hello ${user.name}, you have been assigned as security for <strong>${place.name}</strong>.</p>
            <p>Log in to your dashboard and check the <strong>Work Tab</strong> to see your shift details.</p>
          </div>
        `
      });
    }

    res.json({ 
      success: true, 
      message: isNewUser ? "Staff account created and credentials emailed." : "Existing user notified of assignment.",
      tempPassword: tempPassword 
    });

  } catch (error) {
    console.error("Assignment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeSecurity = async (req, res) => {
  try {
    const { placeId, securityId } = req.params;

    const security = await Security.findOne({
      _id: securityId,
      place: placeId
    });

    if (!security) {
      return res.status(404).json({ 
        success: false,
        message: "Security not found" 
      });
    }

    security.isActive = false;
    security.removedAt = new Date();
    await security.save();

    res.json({ 
      success: true,
      message: "Security removed successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { date } = req.query;

    const visitDate = date ? new Date(date) : new Date();
    visitDate.setHours(0, 0, 0, 0);

    const passes = await Pass.find({
      place: placeId,
      visitDate,
      status: "APPROVED"
    })
    .populate("bookedBy", "name email")
    .populate("guest")
    .sort({ slotNumber: 1 });

    res.json({ 
      success: true,
      date: visitDate,
      count: passes.length,
      slots: passes.map(p => ({
        slotNumber: p.slotNumber,
        guest: p.guest,
        bookedBy: p.bookedBy,
        checkInTime: p.checkInTime,
        checkOutTime: p.checkOutTime,
        status: p.status
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.manualOverride = async (req, res) => {
  try {
    const { eventId } = req.params; 
    const { type, newValue, reason } = req.body;

    const place = await Place.findById(eventId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    if (place.host.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }

    let message = "";
    let previousValue;

    if (type === "capacity") {
      previousValue = place.dailyCapacity;
      place.dailyCapacity = newValue;
      message = "Capacity updated";
    } else if (type === "booking") {
      previousValue = place.isBookingEnabled;
      place.isBookingEnabled = newValue;
      message = "Booking status updated";
    } else {
      return res.status(400).json({ 
        success: false,
        message: "Invalid override type" 
      });
    }

    await place.save();

    res.json({ 
      success: true,
      message: "Manual override applied",
      event: {
        _id: place._id,
        [type]: newValue,
        overrideReason: reason,
        [`previous${type.charAt(0).toUpperCase() + type.slice(1)}`]: previousValue
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getSecurityForPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const hostId = req.user.id;

    // Verify the place belongs to the host
    const place = await Place.findOne({ _id: placeId, host: hostId });
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found or unauthorized'
      });
    }

    // Get all security personnel for this place
    const security = await Security.find({ place: placeId })
      .select('email status isActive assignmentPeriod invitationAcceptedAt firstLoginAt lastLoginAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: security.length,
      security: security.map(s => ({
        _id: s._id,
        email: s.email,
        status: s.status,
        isActive: s.isActive,
        assignmentPeriod: s.assignmentPeriod,
        invitationAcceptedAt: s.invitationAcceptedAt,
        firstLoginAt: s.firstLoginAt,
        lastLoginAt: s.lastLoginAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateEventDetailsWithNotification = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, location, image, price, refundPolicy } = req.body;
    const hostId = req.user.id;

    const Place = require("../models/place");
    const Booking = require("../models/booking");
    const { sendPassEmail } = require("../services/email");

    const place = await Place.findOne({ _id: placeId, host: hostId });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized'
      });
    }

    // Store old values for notification
    const oldDetails = {
      name: place.name,
      location: place.location,
      price: place.price
    };

    // Update fields
    if (name) place.name = name;
    if (location) place.location = location;
    if (image) place.image = image;
    if (price !== undefined) place.price = price;
    if (refundPolicy) {
      place.refundPolicy = {
        ...place.refundPolicy,
        ...refundPolicy
      };
    }

    await place.save();

    // Get all affected bookings
    const bookings = await Booking.find({
      place: placeId,
      visitDate: { $gte: new Date() },
      status: { $in: ['CONFIRMED', 'PENDING'] }
    }).populate('visitor', 'name email');

    // Build list of changes
    const changes = [];
    if (name && name !== oldDetails.name) changes.push(`Name: ${oldDetails.name} → ${name}`);
    if (location && location !== oldDetails.location) changes.push(`Location: ${oldDetails.location} → ${location}`);
    if (price !== undefined && price !== oldDetails.price) changes.push(`Price: ₹${oldDetails.price} → ₹${price}`);

    // Send emails if there are changes
    let notifiedCount = 0;
    if (changes.length > 0) {
      for (const booking of bookings) {
        if (booking.visitor?.email) {
          try {
            const emailContent = `
              <!DOCTYPE html>
              <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                  <h2 style="color: white; margin: 0;">Event Details Updated</h2>
                </div>
                <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                  <p>Dear ${booking.visitor.name},</p>
                  <p>The following details have been updated for <strong>"${place.name}"</strong>:</p>
                  <ul style="background: #f3f4f6; padding: 20px; border-radius: 5px;">
                    ${changes.map(change => `<li style="margin: 10px 0;">${change}</li>`).join('')}
                  </ul>
                  <p style="color: #059669; font-weight: bold;">✓ Your booking remains valid</p>
                  <p>If you have any concerns, please contact support.</p>
                </div>
              </body>
              </html>
            `;

            await sendPassEmail({
              to: booking.visitor.email,
              subject: `Event Updated - ${place.name}`,
              html: emailContent,
              type: 'visitor'
            });
            notifiedCount++;
          } catch (emailError) {
            console.error(`Failed to send email to ${booking.visitor.email}:`, emailError);
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Event details updated successfully',
      place,
      notified: notifiedCount,
      changes: changes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelMyEvent = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { reason } = req.body;
    const hostId = req.user.id;

    const Place = require("../models/place");
    const Pass = require("../models/pass");
    const Booking = require("../models/booking");
    const { sendPassEmail } = require("../services/email");

    const place = await Place.findOne({ 
      _id: placeId, 
      host: hostId 
    });

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found or unauthorized" 
      });
    }

    // Check if event has started
    const now = new Date();
    if (place.eventDates.start <= now) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot cancel event that has already started. Contact admin for emergency cancellation." 
      });
    }

    // Get all active passes
    const activePasses = await Pass.find({ 
      place: placeId,
      status: { $in: ["APPROVED", "PENDING"] },
      paymentStatus: "PAID"
    }).populate("bookedBy", "name email")
      .populate("bookingId");

    if (activePasses.length === 0) {
      // No bookings, just cancel the event
      place.status = "CANCELLED";
      place.isBookingEnabled = false;
      place.cancelledAt = new Date();
      place.cancellationReason = reason;
      await place.save();

      return res.json({
        success: true,
        message: "Event cancelled successfully (no bookings to refund)",
        data: {
          placeId,
          status: "CANCELLED",
          cancelledAt: place.cancelledAt
        }
      });
    }

    let totalRefundAmount = 0;
    const affectedBookings = new Map();

    // Process 100% refunds for all passes
    for (const pass of activePasses) {
      const refundAmount = pass.amountPaid || 0;
      totalRefundAmount += refundAmount;

      pass.status = "CANCELLED";
      pass.refundStatus = "INITIATED";
      pass.refundAmount = refundAmount;
      pass.refundPercentage = 100;
      pass.cancelledAt = new Date();
      pass.cancellationReason = `Event cancelled by host: ${reason}`;
      pass.cancelledBy = "HOST";
      pass.cancelledByUserId = hostId;
      await pass.save();

      // Group by booking
      const bookingId = pass.bookingId._id.toString();
      if (!affectedBookings.has(bookingId)) {
        affectedBookings.set(bookingId, {
          booking: pass.bookingId,
          refundAmount: 0,
          passes: []
        });
      }
      affectedBookings.get(bookingId).refundAmount += refundAmount;
      affectedBookings.get(bookingId).passes.push(pass);
    }

    // Update bookings and send emails
    for (const [bookingId, data] of affectedBookings) {
      const booking = data.booking;
      booking.status = "CANCELLED";
      booking.refundStatus = "FULL";
      booking.refundAmount = data.refundAmount;
      booking.cancelledAt = new Date();
      booking.cancellationReason = `Host cancelled event: ${reason}`;
      await booking.save();

      // Send refund email
      if (booking.visitor?.email) {
        const emailContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #dc2626; padding: 30px; border-radius: 10px 10px 0 0;">
              <h2 style="color: white; margin: 0;">Event Cancelled - Full Refund</h2>
            </div>
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              <p>Dear valued guest,</p>
              <p>We regret to inform you that <strong>"${place.name}"</strong> has been cancelled by the host.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #166534; font-weight: bold;">💰 Refund Amount: ₹${data.refundAmount}</p>
                <p style="margin: 5px 0 0 0; color: #166534; font-size: 14px;">100% refund will be processed within 3-5 business days.</p>
              </div>
              <p>We apologize for any inconvenience.</p>
            </div>
          </body>
          </html>
        `;

        try {
          await sendPassEmail({
            to: booking.visitor.email,
            subject: `Event Cancelled - ${place.name}`,
            html: emailContent,
            type: 'visitor'
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
        }
      }
    }

    // Update place status
    place.status = "CANCELLED";
    place.isBookingEnabled = false;
    place.cancelledAt = new Date();
    place.cancellationReason = reason;
    place.cancelledBy = "HOST";
    await place.save();

    res.json({
      success: true,
      message: "Event cancelled. All visitors will receive 100% refund.",
      data: {
        placeId,
        placeName: place.name,
        status: "CANCELLED",
        cancelledAt: place.cancelledAt,
        reason,
        refundSummary: {
          totalPasses: activePasses.length,
          totalBookings: affectedBookings.size,
          totalRefundAmount,
          refundPercentage: 100,
          processingTime: "3-5 business days"
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