// backend/src/controllers/hostanalytics.js
const Pass = require("../models/pass");
const ScanLog = require("../models/scanlog");
const Place = require("../models/place");
const mongoose = require("mongoose");

exports.getBookingsPerDay = async (req, res) => {
  try {
    const { eventId } = req.params; 
    const { startDate, endDate } = req.query;

    console.log("🔍 DEBUG - Input params:", { eventId, startDate, endDate });

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