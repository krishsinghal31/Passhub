// backend/middlewares/adminAuth.js - UPDATED
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminAuth = async (req, res, next) => {
  try {
    // 1. Extract Token from Header
    const token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Handle SUPER_ADMIN specially
    if (decoded.id === "SUPER_ADMIN" && decoded.role === "SUPER_ADMIN") {
      req.user = {
        _id: "SUPER_ADMIN",
        id: "SUPER_ADMIN",
        role: "SUPER_ADMIN",
        email: process.env.SUPER_ADMIN_EMAIL || "admin@passhub.com",
        name: "Super Admin"
      };
      return next();
    }
    
    // 4. Find User
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    // 5. Role Check
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: "Admin privileges required" });
    }

    // 6. Attach to request and move to next
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const superAdminAuth = async (req, res, next) => {
  // We reuse adminAuth logic first
  await adminAuth(req, res, () => {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: "Super Admin privileges required" });
    }
    next();
  });
};

module.exports = { adminAuth, superAdminAuth };