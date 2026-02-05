// backend/controllers/admin.js 

const User = require("../models/user");
const Pass = require("../models/pass");
const Place = require("../models/place");
const Security = require("../models/security");
const Booking = require("../models/booking");
const SubscriptionPlan = require("../models/subscriptionplan"); 
const crypto = require("crypto");
const { sendAdminInviteMail } = require("../services/admininvitemail");
const { sendPassEmail } = require("../services/email");

exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPasses = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    
    const passes = await Pass.find(query)
      .populate("bookedBy", "name email phone")
      .populate("host", "name email")
      .populate("place", "name location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Pass.countDocuments(query);
    
    res.json({
      success: true,
      passes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.inviteAdmin = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    const { email, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const admin = await User.create({
      name: name || "Admin User",
      email,
      password: passwordHash,
      role: "ADMIN",
      isActive: true
    });

    await sendAdminInviteMail({ email, tempPassword });

    res.status(201).json({ 
      success: true,
      message: "Admin invited successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.disableAdmin = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    const { adminId } = req.params;
    const { reason } = req.body;

    // Prevent self-disable
    if (adminId === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot disable yourself'
      });
    }

    const admin = await User.findOne({
      _id: adminId,
      role: "ADMIN"
    });

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Prevent disabling super admin (though role check above should handle it)
    if (admin.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot disable super admin'
      });
    }

    admin.isActive = false;
    admin.disabledAt = new Date();
    admin.disabledReason = reason || "Disabled by Super Admin";
    await admin.save();

    res.json({ 
      success: true,
      message: "Admin disabled successfully",
      admin: {
        _id: admin._id,
        email: admin.email,
        isActive: admin.isActive,
        disabledAt: admin.disabledAt,
        disabledReason: admin.disabledReason
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false,
        message: "Cannot disable Super Admin" 
      });
    }

    user.isActive = false;
    user.disabledAt = new Date();
    user.disabledReason = reason || "Disabled by Admin";
    await user.save();

    res.json({ 
      success: true,
      message: "User disabled successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        disabledAt: user.disabledAt,
        disabledReason: user.disabledReason
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAllUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Place.find({
      "eventDates.end": { $gte: today }
    })
      .populate('host', 'name email subscription')
      .sort({ "eventDates.start": 1 });

    const enriched = await Promise.all(
      events.map(async (event) => {
        const totalBookings = await Pass.countDocuments({
          place: event._id,
          status: "APPROVED"
        });

        const security = await Security.countDocuments({
          place: event._id,
          isActive: true
        });

        return {
          _id: event._id,
          title: event.name,
          location: event.location,
          image: event.image,
          host: event.host,
          eventDates: event.eventDates,
          capacity: event.dailyCapacity,
          bookings: totalBookings,
          remainingSeats: event.dailyCapacity - totalBookings,
          isBookingEnabled: event.isBookingEnabled,
          security: security,
          price: event.price
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      events: enriched
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({ 
      $or: [
        { role: 'HOST' },
        { 'subscription.isActive': true }
      ]
    })
      .select('name email subscription isActive createdAt')
      .populate('subscription.planId')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      hosts.map(async (host) => {
        const eventsCount = await Place.countDocuments({ host: host._id });
        const activeEvents = await Place.countDocuments({
          host: host._id,
          "eventDates.end": { $gte: new Date() }
        });

        const totalRevenue = await Pass.aggregate([
          { 
            $lookup: {
              from: 'places',
              localField: 'place',
              foreignField: '_id',
              as: 'placeData'
            }
          },
          { $unwind: '$placeData' },
          { 
            $match: { 
              'placeData.host': host._id,
              paymentStatus: 'PAID'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amountPaid' }
            }
          }
        ]);

        return {
          ...host.toObject(),
          eventsCount,
          activeEvents,
          totalRevenue: totalRevenue[0]?.total || 0
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      hosts: enriched
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify Super Admin'
      });
    }

    user.isActive = !user.isActive;
    if (!user.isActive) {
      user.disabledAt = new Date();
      user.disabledReason = reason || 'Toggled by admin';
    } else {
      user.disabledAt = null;
      user.disabledReason = null;
    }
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      user: {
        _id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelEventByAdmin = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const place = await Place.findById(eventId).populate('host', 'name email');

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get all active passes
    const activePasses = await Pass.find({
      place: eventId,
      status: { $in: ['APPROVED', 'PENDING'] },
      paymentStatus: 'PAID'
    }).populate('bookedBy', 'name email')
      .populate('bookingId');

    let totalRefundAmount = 0;
    const affectedBookings = new Map();

    // Process 100% refunds
    for (const pass of activePasses) {
      const refundAmount = pass.amountPaid || 0;
      totalRefundAmount += refundAmount;

      pass.status = 'CANCELLED';
      pass.refundStatus = 'INITIATED';
      pass.refundAmount = refundAmount;
      pass.refundPercentage = 100;
      pass.cancelledAt = new Date();
      pass.cancellationReason = `Event cancelled by admin: ${reason}`;
      pass.cancelledBy = 'ADMIN';
      pass.cancelledByUserId = adminId;
      await pass.save();

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

    // Update bookings
    for (const [bookingId, data] of affectedBookings) {
      const booking = data.booking;
      booking.status = 'CANCELLED';
      booking.refundStatus = 'FULL';
      booking.refundAmount = data.refundAmount;
      booking.cancelledAt = new Date();
      booking.cancellationReason = `Event cancelled by admin: ${reason}`;
      await booking.save();

      // Send email to visitor
      if (booking.visitor?.email) {
        const emailContent = `
          <h2>Event Cancelled - Full Refund Issued</h2>
          <p>Dear visitor,</p>
          <p>We regret to inform you that the event "${place.name}" has been cancelled by the administration.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Refund Amount:</strong> ₹${data.refundAmount}</p>
          <p>Your refund will be processed within 3-5 business days.</p>
        `;

        await sendPassEmail({
          to: booking.visitor.email,
          subject: `Event Cancelled - ${place.name}`,
          html: emailContent,
          type: 'visitor'
        });
      }
    }

    // Update place status
    place.status = 'CANCELLED';
    place.isBookingEnabled = false;
    place.cancelledAt = new Date();
    place.cancellationReason = reason;
    place.cancelledBy = 'ADMIN';
    await place.save();

    // Notify host
    if (place.host?.email) {
      const hostEmailContent = `
        <h2>Your Event Has Been Cancelled</h2>
        <p>Dear ${place.host.name},</p>
        <p>Your event "${place.name}" has been cancelled by the administration.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Total Refunds:</strong> ₹${totalRefundAmount}</p>
        <p><strong>Affected Visitors:</strong> ${affectedBookings.size}</p>
        <p>All visitors have been notified and will receive full refunds.</p>
      `;

      await sendPassEmail({
        to: place.host.email,
        subject: `Event Cancelled - ${place.name}`,
        html: hostEmailContent,
        type: 'host'
      });
    }

    res.json({
      success: true,
      message: 'Event cancelled successfully. All visitors will be refunded 100%.',
      data: {
        eventId,
        eventName: place.name,
        totalRefunds: totalRefundAmount,
        affectedVisitors: affectedBookings.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEventDetailsForAdmin = async (req, res) => {
  try {
    const { eventId } = req.params;

    const place = await Place.findById(eventId).populate('host', 'name email phone subscription');
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const totalBookings = await Pass.countDocuments({
      place: eventId,
      status: 'APPROVED'
    });

    const security = await Security.find({
      place: eventId,
      isActive: true
    }).select('email status assignmentPeriod');

    const revenue = await Pass.aggregate([
      { $match: { place: place._id, paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    res.json({
      success: true,
      event: {
        _id: place._id,
        name: place.name,
        location: place.location,
        image: place.image,
        eventDates: place.eventDates,
        price: place.price,
        capacity: place.dailyCapacity,
        isBookingEnabled: place.isBookingEnabled,
        refundPolicy: place.refundPolicy,
        host: place.host,
        bookings: totalBookings,
        remainingSeats: place.dailyCapacity - totalBookings,
        revenue: revenue[0]?.total || 0,
        security: security
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'SUPER_ADMIN' } });
    const totalEvents = await Place.countDocuments({});
    const totalPasses = await Pass.countDocuments({});
    
    const revenueData = await Pass.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const activeSubscribers = await User.countDocuments({ 
      "subscription.isActive": true 
    });

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers,
        totalEvents: totalEvents,
        totalPasses: totalPasses,
        activeSubscribers: activeSubscribers,
        totalRevenue: revenueData[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Get booked seats for an event
exports.getBookedSeats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const passes = await Pass.find({ place: eventId, status: 'APPROVED' }).select('slotNumber');
    const bookedSeats = passes.map(p => p.slotNumber).filter(Boolean);
    res.json({ success: true, bookedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Create subscription plan
exports.createSubscriptionPlan = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { name, price, durationDays, description, features } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      price,
      durationDays,
      description,
      features: features.filter(f => f.trim())
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      plan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// NEW: Get all subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleSubscriptionPlan = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { planId } = req.params;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({
      success: true,
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      plan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};