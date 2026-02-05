// backend/src/controllers/public.js
const Place = require("../models/place");
const Pass = require("../models/pass");

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

    const featuredEvents = await Place.find({ 
      ...baseQuery, 
      featured: true 
    })
      .populate("host", "name email")
      .limit(5)
      .sort({ "eventDates.start": 1 });

    const upcomingEvents = await Place.find(baseQuery)
      .populate("host", "name email")
      .limit(20)
      .sort({ "eventDates.start": 1 });

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

    const populatedPopularEvents = await Place.populate(popularEvents, {
      path: "host",
      select: "name email"
    });

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