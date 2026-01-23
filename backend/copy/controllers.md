below are the complete controller file code

admin.js

// backend/controllers/admin.js - COMPLETE VERSION

const User = require("../models/user");
const Pass = require("../models/pass");
const Place = require("../models/place");
const Security = require("../models/security");
const Booking = require("../models/booking");
const bcrypt = require("bcryptjs");
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

adminanalytics.js

const ScanLog = require("../models/scanlog");
const Pass = require("../models/pass");
const Booking = require("../models/booking");
const mongoose = require("mongoose");

exports.getPeakActivity = async (req, res) => {
  try {
    const data = await ScanLog.aggregate([
      {
        $group: {
          _id: { $hour: "$scannedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ 
      success: true,
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAverageVisitDuration = async (req, res) => {
  try {
    const data = await Pass.aggregate([
      {
        $match: {
          checkInTime: { $ne: null },
          checkOutTime: { $ne: null }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ["$checkOutTime", "$checkInTime"] },
              60000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);

    res.json({ 
      success: true,
      avgMinutes: data[0]?.avgDuration || 0 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getTrafficByPlace = async (req, res) => {
  try {
    const { placeId } = req.params;

    const filter = placeId ? { place: mongoose.Types.ObjectId(placeId) } : {};

    const data = await ScanLog.aggregate([
      { $match: { ...filter, scanType: "ENTRY" } },
      {
        $group: {
          _id: "$place",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "places",
          localField: "_id",
          foreignField: "_id",
          as: "place"
        }
      },
      { $unwind: "$place" },
      {
        $project: {
          placeName: "$place.name",
          location: "$place.location",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ 
      success: true,
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

adminemergency.js

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
    await AdminActivity.create({
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

auth.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const SubscriptionPlan = require("../models/subscriptionplan");
const { generateToken } = require("../services/token");

const registerUser = async(req,res)=>{
  try{
    const {name,email,password,role} = req.body;
    
    if(!name || !email || !password){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const exist = await User.findOne({email});
    if(exist){
      return res.status(409).json({
        success: false,
        message: "User already exists!"
      });
    }

    // ✅ Hash password BEFORE creating user
    const hashedPassword = await bcrypt.hash(password, 10);

    let defaultPlan = await SubscriptionPlan.findOne({ 
      name: "Default 7-Day", 
      price: 0 
    });
    
    if (!defaultPlan) {
      defaultPlan = await SubscriptionPlan.create({
        name: "Default 7-Day",
        price: 0,
        durationDays: 7,
        isActive: true,
        description: "Free 7-day hosting for new users"
      });
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,  // ✅ Already hashed
      role: role || 'VISITOR',
      subscription: {
        planId: defaultPlan._id,
        isActive: true,
        startDate: now,
        endDate: endDate,
        amountPaid: 0,
        paymentStatus: 'FREE'
      }
    });

    const token = generateToken(user);
    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User registered successfully with 7-day free hosting",
      user,
      token,
      subscription: {
        plan: "Default 7-Day",
        validUntil: endDate,
        daysRemaining: 7
      }
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const loginUser = async(req,res)=>{
  const { email, password } = req.body;

  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { id: "SUPER_ADMIN", role: "SUPER_ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL
    });
  }
  
  try {
    const user = await User.findOne({ email }).populate('subscription.planId');
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // ✅ Use comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const now = new Date();
    const subEnd = new Date(user.subscription.endDate);
    const daysRemaining = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));

    res.json({ 
      success: true,
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email,
      subscription: {
        isActive: user.subscription.isActive && now <= subEnd,
        planName: user.subscription.planId?.name || "Default",
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        endDate: user.subscription.endDate
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
};

host.js
const Place = require("../models/place");
const Pass = require("../models/pass");
const Security = require("../models/security");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendSecurityInviteMail } = require("../templates/securityinvitemail");
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
    const { name, location, image, price, dailyCapacity, refundPolicy } = req.body;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    if (name) place.name = name;
    if (location) place.location = location;
    if (image) place.image = image;
    if (price !== undefined) place.price = price;
    if (dailyCapacity) place.dailyCapacity = dailyCapacity;
    if (refundPolicy) {
      place.refundPolicy = {
        ...place.refundPolicy,
        ...refundPolicy
      };
    }

    await place.save();

    res.json({ 
      success: true,
      message: "Place updated successfully",
      place 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
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

exports.inviteSecurity = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { email, assignmentPeriod } = req.body;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    const existing = await Security.findOne({ 
      email: email.toLowerCase(), 
      place: placeId 
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: "Security already assigned to this place" 
      });
    }

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const security = await Security.create({
      email: email.toLowerCase(),
      passwordHash,
      place: placeId,
      assignedBy: req.user.id,
      assignmentPeriod: {
        start: new Date(assignmentPeriod.start),
        end: new Date(assignmentPeriod.end)
      },
      status: "PENDING",
      isActive: false
    });

    const acceptLink = `${process.env.FRONTEND_URL}/security/accept/${security._id}`;

    await sendSecurityInviteMail({
      to: email,
      tempPassword,
      placeName: place.name,
      acceptLink
    });

    res.json({ 
      success: true,
      message: "Security invitation sent",
      security: {
        id: security._id,
        email: security.email,
        status: security.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
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

exports.cancelMyEvent = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { reason } = req.body;
    const hostId = req.user.id;

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
      place.bookingEnabled = false;
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
      const refundAmount = pass.price || 0;
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

    // Update place status
    place.status = "CANCELLED";
    place.bookingEnabled = false;
    place.cancelledAt = new Date();
    place.cancellationReason = reason;
    place.cancelledBy = "HOST";
    await place.save();

    // Notify admin about cancellation
    await notifyAdminEventCancelled({
      hostId,
      hostName: req.user.name,
      placeId,
      placeName: place.name,
      reason,
      totalRefunds: totalRefundAmount,
      affectedVisitors: affectedBookings.size
    });

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

    // Update fields (same as editPlace)
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

    // ✅ NEW: Get all affected bookings and notify visitors
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

hostanalytics.js

const Pass = require("../models/pass");
const ScanLog = require("../models/scanlog");
const Place = require("../models/place");
const mongoose = require("mongoose");

exports.getBookingsPerDay = async (req, res) => {
  try {
    const { eventId } = req.params; 
    const { startDate, endDate } = req.query;

    console.log("🔍 DEBUG - Input params:", { eventId, startDate, endDate });

    // Get ALL passes for this place to see their actual dates
    const allPasses = await Pass.find({ place: eventId })
      .select('visitDate status')
      .sort({ visitDate: 1 });
    
    console.log("🔍 DEBUG - All passes for this place:");
    allPasses.forEach((pass, i) => {
      console.log(`  Pass ${i + 1}:`, {
        visitDate: pass.visitDate,
        isoDate: pass.visitDate?.toISOString(),
        formattedDate: pass.visitDate?.toISOString().split('T')[0],
        status: pass.status
      });
    });

    // Get date range of actual passes
    if (allPasses.length > 0) {
      const dates = allPasses.map(p => p.visitDate);
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      console.log("🔍 DEBUG - Actual date range of passes:", {
        earliest: minDate.toISOString().split('T')[0],
        latest: maxDate.toISOString().split('T')[0],
        totalPasses: allPasses.length
      });
    }

    // Build filter - FIXED: Use new ObjectId()
    let filter = { place: new mongoose.Types.ObjectId(eventId) };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      console.log("🔍 DEBUG - Requested date range:", {
        requestedStart: start.toISOString().split('T')[0],
        requestedEnd: end.toISOString().split('T')[0]
      });
      
      filter.visitDate = {
        $gte: start,
        $lte: end
      };
    }

    const bookings = await Pass.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$visitDate" }
          },
          bookings: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    const totalBookings = bookings.reduce((sum, day) => sum + day.bookings, 0);
    const avgBookingsPerDay = bookings.length > 0 ? Math.round(totalBookings / bookings.length) : 0;

    res.json({ 
      success: true,
      eventId,
      period: `${startDate || 'start'} to ${endDate || 'end'}`,
      dailyBookings: bookings.map(b => ({
        date: b._id,
        bookings: b.bookings,
        approved: b.approved,
        pending: b.pending,
        cancelled: b.cancelled
      })),
      totalBookings,
      avgBookingsPerDay
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getPeakCheckInHours = async (req, res) => {
  try {
    const { eventId } = req.params;

    const place = await Place.findById(eventId);
    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    // FIXED: Use new ObjectId()
    const data = await ScanLog.aggregate([
      { 
        $match: { 
          place: new mongoose.Types.ObjectId(eventId),
          scanType: "ENTRY",
          status: "SUCCESS"
        } 
      },
      {
        $group: {
          _id: { $hour: "$scannedAt" },
          checkIns: { $sum: 1 }
        }
      },
      { $sort: { checkIns: -1 } },
      { $limit: 5 }
    ]);
    
    const totalCheckIns = await ScanLog.countDocuments({
      place: new mongoose.Types.ObjectId(eventId),
      scanType: "ENTRY",
      status: "SUCCESS"
    });
    
    const peakHours = data.map(d => ({
      hour: `${d._id}:00-${d._id + 1}:00`,
      checkIns: d.checkIns
    }));
    
    const recommendation = peakHours.length > 0 && peakHours[0].checkIns > 40
      ? `Add ${Math.ceil(peakHours[0].checkIns / 30)} more security personnel for ${peakHours[0].hour} slot`
      : "Current security staff is sufficient";

    res.json({ 
      success: true,
      eventId,
      eventDate: place.eventDates.start,
      peakHours,
      totalCheckIns,
      recommendation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getSecurityActivity = async (req, res) => {
  try {
    const { placeId } = req.params;

    // FIXED: Use new ObjectId()
    const data = await ScanLog.aggregate([
      { $match: { place: new mongoose.Types.ObjectId(placeId) } },
      {
        $group: {
          _id: "$scannedBy",
          totalScans: { $sum: 1 },
          entries: {
            $sum: { $cond: [{ $eq: ["$scanType", "ENTRY"] }, 1, 0] }
          },
          exits: {
            $sum: { $cond: [{ $eq: ["$scanType", "EXIT"] }, 1, 0] }
          },
          successful: {
            $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "security"
        }
      },
      { $unwind: "$security" },
      {
        $project: {
          name: "$security.name",
          email: "$security.email",
          totalScans: 1,
          entries: 1,
          exits: 1,
          successful: 1,
          failed: 1
        }
      },
      { $sort: { totalScans: -1 } }
    ]);

    res.json({ 
      success: true,
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

hostsubscription.js

const SubscriptionPlan = require("../models/subscriptionplan");
const HostSubscription = require("../models/hostsubscription");
const User = require("../models/user");
const { sendPassEmail } = require("../services/email");

exports.purchaseSubscription = async (req, res) => {
  try {
    const { planId, startDate } = req.body;
    const userId = req.user.id;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid plan" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    const user = await User.findById(userId);
    
    user.subscription.planId = plan._id;
    user.subscription.isActive = plan.price === 0;
    user.subscription.startDate = start;
    user.subscription.endDate = end;
    user.subscription.amountPaid = plan.price;
    user.subscription.paymentStatus = plan.price === 0 ? "FREE" : "PENDING";
    
    await user.save();

    //  FREE PLAN - Activate immediately and send confirmation
    if (plan.price === 0) {
      // Send confirmation email
      if (user.email) {
        try {
          await sendPassEmail({
            to: user.email,
            subject: "Free Subscription Activated - PassHub",
            html: subscriptionConfirmationTemplate({
              userName: user.name,
              planName: plan.name,
              startDate: start,
              endDate: end,
              price: 0,
              daysRemaining: plan.durationDays
            })
          });
          console.log(`✅ Free subscription email sent to: ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send subscription email:`, emailError);
        }
      }

      return res.json({
        success: true,
        message: "Free subscription activated",
        subscription: user.subscription
      });
    }

    if (user.email) {
      try {
        await sendPassEmail({
          to: user.email,
          subject: "Complete Your Subscription Payment - PassHub",
          html: subscriptionPendingTemplate({
            userName: user.name,
            planName: plan.name,
            price: plan.price,
            durationDays: plan.durationDays
          })
        });
        console.log(`✅ Payment pending email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send payment email:`, emailError);
      }
    }

    res.json({
      success: true,
      message: "Proceed to payment",
      subscription: user.subscription,
      amountToPay: plan.price
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
// Confirm subscription payment
exports.confirmSubscriptionPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.body;

    const user = await User.findById(userId).populate('subscription.planId');
    
    if (!user || !user.subscription || !user.subscription.planId) {
      return res.status(404).json({
        success: false,
        message: "No pending subscription found"
      });
    }

    if (user.subscription.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: "Subscription already paid"
      });
    }

    // Update subscription status
    user.subscription.isActive = true;
    user.subscription.paymentStatus = 'PAID';
    await user.save();

    // Send confirmation email
    if (user.email) {
      try {
        await sendPassEmail({
          to: user.email,
          subject: "Subscription Payment Confirmed - PassHub",
          html: subscriptionConfirmationTemplate({
            userName: user.name,
            planName: user.subscription.planId.name,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            price: user.subscription.amountPaid,
            daysRemaining: Math.ceil((new Date(user.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
            transactionId
          })
        });
        console.log(`✅ Subscription confirmation email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send confirmation email:`, emailError);
      }
    }

    res.json({
      success: true,
      message: "Subscription activated successfully",
      subscription: {
        planName: user.subscription.planId.name,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        isActive: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

pass.js

const Pass = require("../models/pass");
const Booking = require("../models/booking");
const mongoose = require("mongoose");
const { sendCancellationEmail } = require("../services/email");

const cancelGuestPass = async (req, res) => {
  try {
    const { passId } = req.params;
    const visitorId = req.user.id;
    const { reason } = req.body;

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
    if (pass.guest.email) {
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
    if (pass.bookedBy.email && pass.bookedBy.email !== pass.guest.email) {
      await sendCancellationEmail({
        to: pass.bookedBy.email,
        subject: `Pass Cancelled - ${pass.place.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Pass Cancelled</h2>
            <p>Dear ${pass.bookedBy.name},</p>
            <p>A pass you booked for <strong>${pass.guest.name}</strong> at <strong>${pass.place.name}</strong> on <strong>${new Date(pass.visitDate).toDateString()}</strong> has been cancelled.</p>
            
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
    const { passIds, reason } = req.body;
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

    const bookingId = passes[0].bookingId.toString();
    const sameBooking = passes.every(p => p.bookingId.toString() === bookingId);
    
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
      if (pass.guest.email) {
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
            <td style="padding: 10px;">${p.guest.name}</td>
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

payment.js
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
      .populate("bookedBy", "name email")
      .populate("place");

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

      const qrImage = await generateQR({
        passId: pass._id,
        bookingId: pass.bookingId,
        qrToken,
        guest: pass.guest.name,
        place: place.name,
        visitDate: visitDate
      });

      pass.qrImage = qrImage;
      await pass.save();

      if (pass.guest.email) {
        await sendPassEmail({
          to: pass.guest.email,
          subject: `Your Visitor Pass for ${place.name}`,
          html: passEmailTemplate({
            guest: pass.guest,
            place,
            visitDate,
            passes: [pass]
          })
        });
      }

      passesWithQR.push(pass);
    }

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = "CONFIRMED";
      booking.paymentStatus = "PAID";
      await booking.save();
    }

    const visitorEmail = passes[0].bookedBy.email;
    if (visitorEmail) {
      await sendPassEmail({
        to: visitorEmail,
        subject: `Payment Confirmed - ${place.name}`,
        html: passEmailTemplate({
          guest: passes[0].bookedBy,
          place,
          visitDate,
          passes: passesWithQR
        })
      });
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
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


place.js
const Place = require("../models/place");
const Pass = require("../models/pass");

exports.getAllPlaces = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const places = await Place.find({
      isBookingEnabled: true,
      "eventDates.end": { $gte: today }
    })
    .populate("host", "name email")
    .sort({ "eventDates.start": 1 });

    const enrichedPlaces = await Promise.all(
      places.map(async place => {
        const bookedCount = await Pass.countDocuments({
          place: place._id,
          status: "APPROVED"
        });

        return {
          id: place._id,
          name: place.name,
          location: place.location,
          image: place.image,
          host: place.host,
          eventDates: place.eventDates,
          price: place.price,
          dailyCapacity: place.dailyCapacity,
          remainingCapacity: place.dailyCapacity - bookedCount,
          refundPolicy: place.refundPolicy,
          isBookingEnabled: place.isBookingEnabled
        };
      })
    );

    res.json({ 
      success: true,
      count: enrichedPlaces.length,
      places: enrichedPlaces 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;

    const place = await Place.findById(placeId).populate("host", "name email phone");

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    const bookedCount = await Pass.countDocuments({
      place: placeId,
      status: "APPROVED"
    });

    res.json({ 
      success: true,
      place: {
        ...place.toObject(),
        remainingCapacity: place.dailyCapacity - bookedCount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.searchPlaces = async (req, res) => {
  try {
    const { name, location, minPrice, maxPrice, date } = req.query;

    let filter = { isBookingEnabled: true };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (date) {
      const searchDate = new Date(date);
      filter["eventDates.start"] = { $lte: searchDate };
      filter["eventDates.end"] = { $gte: searchDate };
    }

    const places = await Place.find(filter).populate("host", "name email");

    res.json({ 
      success: true,
      count: places.length,
      places 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

placeanalytics.js
const Pass = require("../models/pass");
const mongoose = require("mongoose");

exports.getPlaceVisitStats = async (req, res) => {
  try {
    const { placeId } = req.params;

    const data = await Pass.aggregate([
      {
        $match: {
          place: mongoose.Types.ObjectId(placeId),
          checkInTime: { $ne: null },
          checkOutTime: { $ne: null }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ["$checkOutTime", "$checkInTime"] },
              60000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" },
          totalVisits: { $sum: 1 }
        }
      }
    ]);

    res.json({ 
      success: true,
      data: data[0] || { avgDuration: 0, totalVisits: 0 } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


public.js
const Place = require("../models/place");
const Pass = require("../models/pass");

// Get all events for home page
exports.getHomeEvents = async (req, res) => {
  try {
    const { city, category, date } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let baseQuery = {
      isBookingEnabled: true,
      "eventDates.end": { $gte: today }
    };
    
    if (city) baseQuery.location = { $regex: city, $options: 'i' };
    if (category) baseQuery.category = category;
    if (date) {
      const searchDate = new Date(date);
      baseQuery["eventDates.start"] = { $lte: searchDate };
      baseQuery["eventDates.end"] = { $gte: searchDate };
    }

    // Featured events
    const featuredEvents = await Place.find({ 
      ...baseQuery, 
      featured: true 
    })
      .populate("host", "name email")
      .limit(5)
      .sort({ "eventDates.start": 1 });

    // Upcoming events (sorted by date)
    const upcomingEvents = await Place.find(baseQuery)
      .populate("host", "name email")
      .limit(20)
      .sort({ "eventDates.start": 1 });

    // Popular events (by bookings)
    const popularEvents = await Place.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "passes",
          localField: "_id",
          foreignField: "place",
          as: "bookings"
        }
      },
      {
        $addFields: {
          bookingCount: { $size: "$bookings" }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate host for popular events
    //const Place = require("../models/place");
    const populatedPopularEvents = await Place.populate(popularEvents, {
      path: "host",
      select: "name email"
    });

    // Get categories with counts
    const categories = await Place.aggregate([
      { $match: baseQuery },
      { 
        $group: { 
          _id: "$category", 
          count: { $sum: 1 },
          places: { $push: "$$ROOT" }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Enrich events with booking data
    const enrichEvent = async (event) => {
      const totalBookings = await Pass.countDocuments({
        place: event._id,
        status: "APPROVED"
      });

      const availableSeats = event.dailyCapacity - totalBookings;

      return {
        _id: event._id,
        title: event.name,
        description: event.description || `Event at ${event.name}`,
        place: {
          _id: event._id,
          name: event.name,
          city: event.location,
          images: event.image ? [event.image] : []
        },
        date: event.eventDates.start,
        endDate: event.eventDates.end,
        time: "10:00 AM - 6:00 PM",
        category: event.category || "general",
        price: event.price,
        availableSeats,
        totalCapacity: event.dailyCapacity,
        tags: event.tags || ["event", "venue"],
        featured: event.featured || false,
        rating: event.rating || 4.5,
        host: event.host
      };
    };

    const enrichedFeatured = await Promise.all(featuredEvents.map(enrichEvent));
    const enrichedUpcoming = await Promise.all(upcomingEvents.map(enrichEvent));
    const enrichedPopular = await Promise.all(populatedPopularEvents.map(enrichEvent));

    res.json({
      success: true,
      featuredEvents: enrichedFeatured,
      upcomingEvents: enrichedUpcoming,
      popularEvents: enrichedPopular,
      categories: categories.map(cat => ({
        name: cat._id || "General",
        count: cat.count,
        icon: `${cat._id || 'general'}-icon-url`
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get featured events only
exports.getFeaturedEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const featuredEvents = await Place.find({
      isBookingEnabled: true,
      featured: true,
      "eventDates.end": { $gte: today }
    })
      .populate("host", "name email")
      .limit(10)
      .sort({ "eventDates.start": 1 });

    const enriched = await Promise.all(
      featuredEvents.map(async event => {
        const totalBookings = await Pass.countDocuments({
          place: event._id,
          status: "APPROVED"
        });

        return {
          _id: event._id,
          title: event.name,
          place: {
            _id: event._id,
            name: event.name,
            city: event.location,
            images: event.image ? [event.image] : []
          },
          date: event.eventDates.start,
          price: event.price,
          availableSeats: event.dailyCapacity - totalBookings,
          totalCapacity: event.dailyCapacity
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

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categories = await Place.aggregate([
      {
        $match: {
          isBookingEnabled: true,
          "eventDates.end": { $gte: today }
        }
      },
      { 
        $group: { 
          _id: "$category", 
          count: { $sum: 1 }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id || "General",
        count: cat.count,
        icon: `${cat._id || 'general'}-icon-url`
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


refund.js
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

      if (pass.refundStatus !== "NONE" && pass.refundStatus !== undefined) {
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


scancontroller.js
const Pass = require("../models/pass");
const ScanLog = require("../models/scanlog");
const { isHostingActive } = require("../utils/hostingvalidity");

exports.scanPass = async (req, res) => {
  try {
    const { qrCode, eventId } = req.body; 
    const security = req.security;

    if (!qrCode) {
      return res.status(400).json({ 
        success: false,
        message: "QR code required" 
      });
    }

    const qrParts = qrCode.split('|');
    
    if (qrParts.length !== 2) {
      await ScanLog.create({
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: "Invalid QR code format"
      });

      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invalid QR code format"
      });
    }

    const [passId, qrToken] = qrParts;
    
    const pass = await Pass.findById(passId)
      .populate("place")
      .populate("bookedBy", "name email")
      .populate("guest");

    if (!pass) {
      await ScanLog.create({
        pass: passId,
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: "Pass not found"
      });

      return res.status(404).json({ 
        success: false,
        valid: false,
        message: "Pass not found" 
      });
    }

    // Verify place matches
    if (pass.place._id.toString() !== security.place._id.toString()) {
      console.log('❌ Place mismatch');
      
      await ScanLog.create({
        pass: passId,
        visitor: pass.bookedBy._id,
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: "Pass not for this place"
      });

      return res.status(403).json({ 
        success: false,
        valid: false,
        message: "Pass not for this place" 
      });
    }

    // Verify QR token
    if (pass.qrToken !== qrToken) {
      console.log('❌ Invalid QR token');
      
      await ScanLog.create({
        pass: passId,
        visitor: pass.bookedBy._id,
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: "Invalid QR token"
      });

      return res.status(400).json({ 
        success: false,
        valid: false,
        message: "Invalid or tampered QR code" 
      });
    }

    // Check if QR is active
    if (!pass.qrActive) {
      console.log('❌ QR inactive');
      
      await ScanLog.create({
        pass: passId,
        visitor: pass.bookedBy._id,
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: "QR code inactive"
      });

      return res.status(400).json({ 
        success: false,
        valid: false,
        message: "QR code is inactive or cancelled" 
      });
    }

    // Check pass status
    if (pass.status !== "APPROVED") {
      await ScanLog.create({
        pass: passId,
        visitor: pass.bookedBy._id,
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: `Pass status: ${pass.status}`
      });

      return res.status(400).json({ 
        success: false,
        valid: false,
        message: `Pass is ${pass.status}` 
      });
    }

    // Check visit date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(pass.visitDate);
    visitDate.setHours(0, 0, 0, 0);

    if (visitDate.getTime() !== today.getTime()) {
      await ScanLog.create({
        pass: passId,
        visitor: pass.bookedBy._id,
        place: security.place._id,
        scannedBy: security._id,
        scanType: "ENTRY",
        status: "FAILED",
        failureReason: "Visit date mismatch"
      });

      return res.status(400).json({ 
        success: false,
        valid: false,
        message: `Pass is valid for ${visitDate.toLocaleDateString()}, not today` 
      });
    }

    // Check if already checked in
    if (pass.checkInTime) {
      return res.status(400).json({ 
        success: false,
        valid: false,
        message: "Already checked in",
        alreadyCheckedIn: true,
        usedAt: pass.checkInTime
      });
    }

    // Check if already exited
    if (pass.checkOutTime) {
      return res.status(400).json({ 
        success: false,
        valid: false,
        message: "Visitor already exited. Cannot re-enter." 
      });
    }

    pass.checkInTime = new Date();
    await pass.save();

    console.log('✅ Check-in successful for:', pass.guest.name);

    // Create success log
    await ScanLog.create({
      pass: passId,
      visitor: pass.bookedBy._id,
      host: pass.host,
      place: pass.place._id,
      scannedBy: security._id,
      scanType: "ENTRY",
      status: "SUCCESS"
    });

    res.json({ 
      success: true,
      valid: true,
      message: "Pass verified successfully",
      visitor: {
        name: pass.guest.name,
        email: pass.guest.email,
        passType: pass.amountPaid > 0 ? "PAID" : "FREE"
      },
      event: {
        title: pass.place.name,
        date: pass.visitDate,
        time: "10:00 AM"
      },
      checkInTime: pass.checkInTime,
      slotNumber: pass.slotNumber,
      alreadyCheckedIn: false
    });
    
  } catch (error) {
    console.error("❌ Scan error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getSecurityDashboard = async (req, res) => {
  try {
    const security = req.security;

    const totalScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: todayStart }
    });

    const validScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: todayStart },
      status: "SUCCESS"
    });

    const invalidScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: todayStart },
      status: "FAILED"
    });

    const currentOccupancy = await Pass.countDocuments({
      place: security.place._id,
      visitDate: todayStart,
      checkInTime: { $ne: null },
      checkOutTime: null
    });

    const scansByType = await ScanLog.aggregate([
      {
        $match: {
          scannedBy: security._id,
          place: security.place._id,
          scannedAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: "$scanType",
          count: { $sum: 1 }
        }
      }
    ]);

    const recentScans = await ScanLog.find({
      scannedBy: security._id,
      place: security.place._id
    })
    .populate("visitor", "name")
    .sort({ scannedAt: -1 })
    .limit(10);

    const Place = require("../models/place");
    const currentEvents = await Place.find({
      _id: security.place._id,
      "eventDates.start": { $lte: new Date() },
      "eventDates.end": { $gte: new Date() }
    });

    res.json({
      success: true,
      todayStats: {
        totalScans: todayScans,
        uniqueVisitors: validScans,
        invalidScans,
        currentOccupancy
      },
      currentEvents: currentEvents.map(place => ({
        _id: place._id,
        title: place.name,
        expectedAttendees: place.dailyCapacity,
        checkedIn: currentOccupancy,
        startTime: "10:00 AM",
        status: "ongoing"
      })),
      recentScans: recentScans.map(scan => ({
        visitorName: scan.visitor?.name || "Unknown",
        time: scan.scannedAt,
        status: scan.status === "SUCCESS" ? "valid" : "invalid"
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getSecurityActivity = async (req, res) => {
  try {
    const security = req.security;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const totalScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: targetDate, $lt: nextDay }
    });

    const validScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: targetDate, $lt: nextDay },
      status: "SUCCESS"
    });

    const invalidScans = await ScanLog.countDocuments({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: targetDate, $lt: nextDay },
      status: "FAILED"
    });

    const timeline = await ScanLog.aggregate([
      {
        $match: {
          scannedBy: security._id,
          place: security.place._id,
          scannedAt: { $gte: targetDate, $lt: nextDay }
        }
      },
      {
        $group: {
          _id: { $hour: "$scannedAt" },
          scans: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const invalidAttempts = await ScanLog.find({
      scannedBy: security._id,
      place: security.place._id,
      scannedAt: { $gte: targetDate, $lt: nextDay },
      status: "FAILED"
    })
    .populate("pass", "qrCode")
    .limit(20);

    res.json({
      success: true,
      date: targetDate.toDateString(),
      totalScans,
      validScans,
      invalidScans,
      timeline: timeline.map(t => ({
        hour: `${t._id}:00`,
        scans: t.scans
      })),
      invalidAttempts: invalidAttempts.map(attempt => ({
        time: attempt.scannedAt,
        qrCode: attempt.pass?.qrCode || "Unknown",
        reason: attempt.failureReason
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


security-login.js
const Security = require("../models/security");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateSecurityToken } = require("../services/token");

exports.loginAsSecurity = async (req, res) => {
  try {
    const { email, password, placeId } = req.body; 

    if (!email || !password || !placeId) {
      return res.status(400).json({ 
        success: false,
        message: "Email, password, and placeId required" 
      });
    }

    const security = await Security.findOne({
      email: email.toLowerCase(),
      place: placeId,
      isActive: true
    }).populate("place");

    if (!security) {
      return res.status(404).json({ 
        success: false,
        message: "Security assignment not found or inactive" 
      });
    }

    const isMatch = await bcrypt.compare(password, security.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(security.assignmentPeriod.start);
    const end = new Date(security.assignmentPeriod.end);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start || today > end) {
      return res.status(403).json({ 
        success: false,
        message: "Security access expired or not yet started" 
      });
    }

    security.lastLoginAt = new Date();
    if (!security.firstLoginAt) {
      security.firstLoginAt = new Date();
    }
    security.loginCount = (security.loginCount || 0) + 1;
    await security.save();

    const token = generateSecurityToken(security);

    res.json({
      success: true,
      message: "Security login successful",
      token,
      security: {
        id: security._id,
        email: security.email,
        place: {
          id: security.place._id,
          name: security.place.name,
          location: security.place.location
        },
        assignmentPeriod: security.assignmentPeriod
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.acceptSecurityInvite = async (req, res) => {
  try {
    const { securityId, inviteToken } = req.params;
    const { password, confirmPassword } = req.body;

    let security;

    if (securityId) {
      security = await Security.findById(securityId).populate("place");
    } else if (inviteToken) {
      security = await Security.findOne({ inviteToken }).populate("place");
    }

    if (!security) {
      return res.status(404).json({ 
        success: false,
        message: "Security invitation not found" 
      });
    }

    if (security.status === "ACCEPTED") {
      return res.status(400).json({ 
        success: false,
        message: "Invitation already accepted" 
      });
    }

    // If password provided, update it
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ 
          success: false,
          message: "Passwords do not match" 
        });
      }

      const newHash = await bcrypt.hash(password, 10);
      security.passwordHash = newHash;
    }

    security.status = "ACCEPTED";
    security.isActive = true;
    security.invitationAcceptedAt = new Date();
    await security.save();

    res.json({
      success: true,
      message: "Security invitation accepted successfully",
      security: {
        id: security._id,
        email: security.email,
        place: {
          id: security.place._id,
          name: security.place.name
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

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const security = req.security;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All password fields required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "New passwords do not match" 
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, security.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    security.passwordHash = newHash;
    security.passwordChangedAt = new Date();
    await security.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


subscription.js
const SubscriptionPlan = require("../models/subscriptionplan");

exports.createPlan = async (req, res) => {
  try {
    const { name, price, durationDays, description, features } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      price,
      durationDays,
      description,
      features,
      isActive: true
    });

    res.status(201).json({ 
      success: true,
      message: "Subscription plan created",
      plan 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    
    res.json({ 
      success: true,
      count: plans.length,
      plans 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getApplicablePlans = async (req, res) => {
  try {
    const { durationDays } = req.query;

    if (!durationDays) {
      return res.status(400).json({ 
        success: false,
        message: "Duration days required" 
      });
    }

    const plans = await SubscriptionPlan.find({
      durationDays: { $gte: Number(durationDays) },
      isActive: true
    }).sort({ price: 1 });

    res.json({ 
      success: true,
      count: plans.length,
      plans 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.togglePlan = async (req, res) => {
  try {
    const { planId } = req.params; 
    
    const plan = await SubscriptionPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false,
        message: "Plan not found" 
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({ 
      success: true,
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'}`,
      plan 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

visitor.js
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

    if (!placeId || !visitDate || !guests || guests.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Place, visit date, and guest details required" 
      });
    }

    if (guests.length > 6) {
      return res.status(400).json({ 
        success: false,
        message: "Maximum 6 guests allowed per booking. Please create multiple bookings if you need more passes." 
      });
    }

    const place = await Place.findById(placeId).populate("host");

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    if (!place.isBookingEnabled) {
      return res.status(400).json({ 
        success: false,
        message: "Booking is disabled for this place" 
      });
    }

    const vDate = new Date(visitDate);
    vDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (vDate < today) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot book for past dates" 
      });
    }

    const eventStart = new Date(place.eventDates.start);
    const eventEnd = new Date(place.eventDates.end);
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);

    if (vDate < eventStart || vDate > eventEnd) {
      return res.status(400).json({ 
        success: false,
        message: "Visit date is outside event dates" 
      });
    }

    const approvedCount = await Pass.countDocuments({
      place: placeId,
      visitDate: vDate,
      status: "APPROVED"
    });

    if (approvedCount + guests.length > place.dailyCapacity) {
      return res.status(400).json({ 
        success: false,
        message: `Only ${place.dailyCapacity - approvedCount} slots available` 
      });
    }

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

    // ✅ Get visitor info for email
    const User = require("../models/user");
    const visitor = await User.findById(visitorId).select("name email");

    // Create passes WITHOUT qrToken (will be null initially)
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

    // If free event, generate QR codes immediately
    if (place.price === 0) {
      const approvedCountNow = await Pass.countDocuments({
        place: placeId,
        visitDate: vDate,
        status: "APPROVED"
      });

      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i];
        const qrToken = crypto.randomUUID();

        pass.status = "APPROVED";
        pass.paymentStatus = "FREE";
        pass.slotNumber = approvedCountNow + i + 1;
        pass.qrToken = qrToken;
        pass.qrActive = true;

        pass.refundSnapshot = {
          isRefundable: place.refundPolicy.isRefundable,
          beforeVisitPercent: place.refundPolicy.beforeVisitPercent,
          sameDayPercent: place.refundPolicy.sameDayPercent,
          description: place.refundPolicy.description
        };

        const qrImage = await generateQR({
          passId: pass._id.toString(),
          bookingId: pass.bookingId.toString(),
          qrToken,
          guest: pass.guest.name,
          place: place.name,
          visitDate: vDate.toISOString()
        });

        pass.qrImage = qrImage;
        await pass.save();

        // ✅ Send email to each guest
        if (pass.guest.email) {
          try {
            await sendPassEmail({
              to: pass.guest.email,
              subject: `Your Free Pass for ${place.name}`,
              html: passEmailTemplate({
                guest: pass.guest,
                place,
                visitDate: vDate,
                passes: [pass]
              })
            });
            console.log(`✅ Email sent to guest: ${pass.guest.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to ${pass.guest.email}:`, emailError);
          }
        }
      }

      booking.status = "CONFIRMED";
      booking.paymentStatus = "FREE";
      await booking.save();

      // ✅ NEW: Send summary email to visitor who booked
      if (visitor && visitor.email) {
        try {
          await sendPassEmail({
            to: visitor.email,
            subject: `Booking Confirmed - ${place.name}`,
            html: passEmailTemplate({
              guest: { name: visitor.name, email: visitor.email },
              place,
              visitDate: vDate,
              passes: passes // Send all passes
            })
          });
          console.log(`✅ Summary email sent to visitor: ${visitor.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send summary email to ${visitor.email}:`, emailError);
        }
      }

      return res.json({
        success: true,
        message: "Free booking confirmed! Passes generated and emails sent.",
        bookingId: booking._id,
        passes: passes.map(p => ({
          passId: p._id,
          guest: p.guest.name,
          slotNumber: p.slotNumber,
          qrImage: p.qrImage,
          status: p.status
        }))
      });
    }

    if (visitor && visitor.email) {
      try {
        const pendingEmailTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Pending Payment</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">⏳ Payment Pending</h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <h2 style="margin: 0 0 15px 0; color: #1f2937;">Hello ${visitor.name}! 👋</h2>
                        <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Your booking for <strong>${place.name}</strong> has been created successfully. Please complete the payment to confirm your passes.
                        </p>

                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #92400e; font-weight: bold;">📋 Booking Details:</p>
                          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #78350f;">
                            <li><strong>Booking ID:</strong> ${booking._id}</li>
                            <li><strong>Place:</strong> ${place.name}</li>
                            <li><strong>Location:</strong> ${place.location}</li>
                            <li><strong>Visit Date:</strong> ${vDate.toDateString()}</li>
                            <li><strong>Number of Guests:</strong> ${guests.length}</li>
                            <li><strong>Total Amount:</strong> ₹${booking.totalAmount}</li>
                          </ul>
                        </div>

                        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #1e40af; font-weight: bold;">👥 Guests:</p>
                          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e3a8a;">
                            ${guests.map(g => `<li>${g.name} - ${g.email || 'No email'}</li>`).join('')}
                          </ul>
                        </div>

                        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ Action Required:</p>
                          <p style="margin: 10px 0 0 0; color: #7f1d1d;">Please complete the payment to receive your QR codes. Your booking will expire if payment is not completed within 24 hours.</p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                          Need help? Contact us at <a href="mailto:support@visitorpass.com" style="color: #3b82f6; text-decoration: none;">support@visitorpass.com</a>
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        await sendPassEmail({
          to: visitor.email,
          subject: `Booking Created - Payment Pending - ${place.name}`,
          html: pendingEmailTemplate
        });
        console.log(`✅ Pending payment email sent to visitor: ${visitor.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send pending email to ${visitor.email}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: "Booking created. Please proceed to payment. Confirmation email sent.",
      bookingId: booking._id,
      amountToPay: booking.totalAmount,
      passes: passes.map(p => ({
        passId: p._id,
        guest: p.guest.name,
        status: p.status
      }))
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
//returns all active upcoming event's passes
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
//returns all passes booked by visitor
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
// get details of it's specific booking
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("place")
      .populate("visitor", "name email");

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    if (booking.visitor._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }

    const passes = await Pass.find({ bookingId });

    res.json({ 
      success: true,
      booking: {
        ...booking.toObject(),
        passes
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};