// backend/src/controllers/security-login.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Security = require("../models/security");

exports.getMyWork = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    const assignments = await Security.find({ 
      email: userEmail,
      isActive: true 
    })
    .populate({
      path: 'place',
      select: 'name location image isBookingEnabled' 
    })
    .sort({ 'assignmentPeriod.start': 1 });

    res.json({
      success: true,
      assignments: assignments.map(job => ({
        _id: job._id,
        place: job.place,
        startsAt: job.assignmentPeriod.start,
        expiresAt: job.assignmentPeriod.end,
        isShiftActive: new Date() >= new Date(job.assignmentPeriod.start) && 
                       new Date() <= new Date(job.assignmentPeriod.end)
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};