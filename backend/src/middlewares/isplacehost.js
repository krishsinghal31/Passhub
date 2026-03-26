// src/middlewares/isplacehost.js
const Place = require("../models/place");

const isPlaceHost = async (req, res, next) => {  
  try {
    const { placeId } = req.params;
    const userId = req.user.id || req.user._id; 

    if (!placeId) {
      return res.status(400).json({ success: false, message: "Place ID required" });
    }

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    if (place.host.toString() !== userId.toString()) {
      console.log(`Access Denied: Place Host (${place.host}) !== Requester (${userId})`);
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to manage this place" 
      });
    }

    req.place = place;
    next();  
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = isPlaceHost;
