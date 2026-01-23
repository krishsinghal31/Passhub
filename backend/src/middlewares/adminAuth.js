// backend/middleware/adminAuth.js - UPDATED

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

const superAdminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user is SUPER_ADMIN only
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super Admin privileges required."
      });
    }

    next();
  } catch (error) {
    console.error("Super Admin auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed"
    });
  }
};

module.exports = { adminAuth, superAdminAuth };