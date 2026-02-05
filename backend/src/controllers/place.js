// controllers/place.js
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