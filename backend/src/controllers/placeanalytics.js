// controllers/placeanalytics.js
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