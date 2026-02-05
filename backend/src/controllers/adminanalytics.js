// backend/src/controllers/adminanalytics.js
const ScanLog = require("../models/scanlog");
const Pass = require("../models/pass");
const Booking = require("../models/booking");
const mongoose = require("mongoose");

// exports.getPeakActivity = async (req, res) => {
//   try {
//     const data = await ScanLog.aggregate([
//       {
//         $group: {
//           _id: { $hour: "$scannedAt" },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { "_id": 1 } }
//     ]);

//     res.json({ 
//       success: true,
//       data 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       message: error.message 
//     });
//   }
// };
exports.getPeakActivity = async (req, res) => {
  try {
    const data = await ScanLog.aggregate([
      {
        $project: {
          hour: { $hour: { $toDate: "$scannedAt" } } 
        }
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
