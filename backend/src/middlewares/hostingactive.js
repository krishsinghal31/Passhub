//backend/src/middlewares/hostingactive.js
const User = require("../models/user");

const hostingActive = async (req, res, next) => {  
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (!user.isActive || user.isHostingDisabled) {
      return res.status(403).json({ 
        success: false,
        message: "Your hosting access is disabled by admin" 
      });
    }

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