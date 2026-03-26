//backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Security = require('../models/security');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id === "SUPER_ADMIN" && decoded.role === "SUPER_ADMIN") {
      req.user = {
        id: "SUPER_ADMIN",
        role: "SUPER_ADMIN",
        email: process.env.SUPER_ADMIN_EMAIL || "admin@passhub.com",
        name: "Super Admin"
      };
      return next();
    }

    // Check if it's a security token or regular user token
    if (decoded.role === 'SECURITY') {
      // SECURITY role can come from either:
      // 1) a real Security document/token (Security doc exists with _id === decoded.id)
      // 2) a normal User login where user.role === "SECURITY" but decoded.id === User._id
      let security = null;
      try {
        security = await Security.findById(decoded.id).populate('place');
      } catch (_) {
        // ignore and try User fallback below
      }

      if (security && security.isActive) {
        req.user = {
          id: security._id,
          role: 'SECURITY',
          email: security.email,
          placeId: decoded.placeId
        };
      } else {
        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'SECURITY') {
          return res.status(401).json({
            success: false,
            message: 'Security account not found or disabled'
          });
        }

        // Fallback: use user's email to resolve assignments in /security/my-assignments
        req.user = {
          id: user._id,
          role: 'SECURITY',
          email: user.email,
          name: user.name,
          placeId: decoded.placeId
        };
      }
    } else {
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      };
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = authMiddleware;