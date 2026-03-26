//backend/src/middlewares/hostingactive.js
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