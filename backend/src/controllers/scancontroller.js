// backend/src/controllers/scancontroller.js
const Pass = require("../models/pass");
const ScanLog = require("../models/scanlog");
const Security = require("../models/security");
const Place = require("../models/place");
const Booking = require("../models/booking");


const verifyAssignment = async (userEmail, placeId) => {
  return await Security.findOne({ 
    email: userEmail.toLowerCase(), 
    place: placeId,
    isActive: true 
  });
};

exports.scanPass = async (req, res) => {
  try {
    const { qrCode, placeId } = req.body; 
    const userEmail = req.user.email;

    const assignment = await verifyAssignment(userEmail, placeId);
    if (!assignment) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: You are not assigned to this event's staff." 
      });
    }

    if (!qrCode) {
      return res.status(400).json({ success: false, message: "QR code required" });
    }

    const qrParts = qrCode.trim().split('|');
    if (qrParts.length !== 2) {
      return res.status(400).json({ success: false, message: "Invalid QR code format" });
    }

    const [passId, qrToken] = qrParts;

    const pass = await Pass.findById(passId)
      .populate("place")
      .populate("guest");

    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found in system" });
    }

    if (pass.place._id.toString() !== placeId) {
      return res.status(403).json({ success: false, message: "This pass is for a different venue/event." });
    }

    if (pass.qrToken.trim() !== qrToken.trim()) {
       return res.status(400).json({ success: false, message: "Security Alert: QR Token mismatch. Possible outdated or tampered pass." });
    }

    if (!pass.qrActive) {
      return res.status(400).json({ success: false, message: "This QR code has been deactivated." });
    }

    if (pass.status !== "APPROVED") {
      return res.status(400).json({ success: false, message: `Access Denied: Pass status is ${pass.status}` });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 

    const visitDate = new Date(pass.visitDate);
    visitDate.setUTCHours(0, 0, 0, 0); 

    if (visitDate.getTime() !== today.getTime()) {
      const formattedDate = visitDate.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      return res.status(400).json({ 
        success: false, 
        message: `Invalid Date: Pass is valid for ${formattedDate}.` 
      });
    }

    if (pass.checkInTime && !pass.checkOutTime) {
      return res.status(400).json({ success: false, message: "Security Alert: Visitor is already checked in." });
    }

    if (pass.checkOutTime) {
      return res.status(400).json({ success: false, message: "Access Expired: Visitor has already checked out." });
    }

    pass.checkInTime = new Date();
    await pass.save();

    await ScanLog.create({
      pass: passId,
      place: placeId,
      scannedBy: req.user.id,
      scanType: "ENTRY",
      status: "SUCCESS"
    });

    res.json({ 
      success: true, 
      message: "Access Granted: Check-in Successful!",
      visitor: {
        name: pass.guest.name,
        email: pass.guest.email,
        checkInTime: pass.checkInTime
      }
    });
    
  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error during scanning" });
  }
};

exports.getSecurityDashboard = async (req, res) => {
  try {
    const { placeId } = req.params;
    const userEmail = req.user.email;

    const assignment = await verifyAssignment(userEmail, placeId);
    if (!assignment) {
      return res.status(403).json({ success: false, message: "Permission Denied" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = await ScanLog.aggregate([
      { 
        $match: { 
          place: assignment.place, 
          scannedAt: { $gte: todayStart } 
        } 
      },
      { 
        $group: {
          _id: null,
          totalScans: { $sum: 1 },
          successful: { $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } }
        }
      }
    ]);

    const currentOccupancy = await Pass.countDocuments({
      place: placeId,
      checkInTime: { $ne: null },
      checkOutTime: null
    });

    const recentScans = await ScanLog.find({ place: placeId })
      .populate({
        path: 'pass',
        populate: { path: 'guest', select: 'name' }
      })
      .sort({ scannedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        total: stats[0]?.totalScans || 0,
        success: stats[0]?.successful || 0,
        failed: stats[0]?.failed || 0,
        occupancy: currentOccupancy
      },
      recentScans: recentScans.map(scan => ({
        visitorName: scan.pass?.guest?.name || "Unknown",
        time: scan.scannedAt,
        status: scan.status,
        type: scan.scanType
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSecurityActivity = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const logs = await ScanLog.find({
      place: placeId,
      scannedAt: { $gte: targetDate, $lt: nextDay }
    })
    .populate({
        path: 'pass',
        populate: { path: 'guest', select: 'name' }
    })
    .sort({ scannedAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      activity: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};