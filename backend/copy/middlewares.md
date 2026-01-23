below are the middleware files

auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => { 
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's super admin hardcoded login
    if (decoded.id === "SUPER_ADMIN" && decoded.role === "SUPER_ADMIN") {
      req.user = {
        id: "SUPER_ADMIN",
        role: "SUPER_ADMIN"
      };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Account is disabled" 
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();  
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};

module.exports = authMiddleware;

hostingactive.js

const User = require("../models/user");

const hostingActive = async (req, res, next) => {  
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("subscription.planId");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (!user.subscription || !user.subscription.planId) {
      return res.status(403).json({ 
        success: false,
        message: "No active subscription. Please purchase a hosting plan." 
      });
    }

    const now = new Date();
    const endDate = new Date(user.subscription.endDate);

    if (now > endDate) {
      return res.status(403).json({ 
        success: false,
        message: "Subscription expired. Please renew to continue hosting." 
      });
    }

    if (!user.subscription.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Subscription is inactive. Please activate or purchase a new plan." 
      });
    }

    // Attach subscription info to request for later use
    req.subscription = {
      planId: user.subscription.planId._id,
      planName: user.subscription.planId.name,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      daysRemaining: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    };

    next();  
  } catch (error) {
    console.error("Hosting active middleware error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = hostingActive;

isplacehost.js

const Place = require("../models/place");

const isPlaceHost = async (req, res, next) => {  
  try {
    const { placeId } = req.params;
    const userId = req.user.id;

    if (!placeId) {
      return res.status(400).json({ 
        success: false,
        message: "Place ID required" 
      });
    }

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ 
        success: false,
        message: "Place not found" 
      });
    }

    if (place.host.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to access this place" 
      });
    }

    // Attach place to request for later use
    req.place = place;

    next();  
  } catch (error) {
    console.error("Is place host middleware error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = isPlaceHost;

role.js

const authorize = (...roles) => {
  return (req, res, next) => {  
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ 
          success: false,
          message: "Authentication required" 
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied. Insufficient permissions." 
        });
      }

      next(); 
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };
};

module.exports = authorize;

securityauth.js

const authorize = (...roles) => {
  return (req, res, next) => {  
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ 
          success: false,
          message: "Authentication required" 
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied. Insufficient permissions." 
        });
      }

      next(); 
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };
};

module.exports = authorize;

adminAuth.js
// backend/middleware/adminAuth.js - CREATE THIS FILE

const adminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user is ADMIN or SUPER_ADMIN
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed"
    });
  }
};

module.exports = { adminAuth };