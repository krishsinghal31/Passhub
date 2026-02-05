// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const authMiddleware = async (req, res, next) => { 
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ 
//         success: false,
//         message: "No token provided" 
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid token format" 
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Check if it's super admin hardcoded login
//     if (decoded.id === "SUPER_ADMIN" && decoded.role === "SUPER_ADMIN") {
//       req.user = {
//         id: "SUPER_ADMIN",
//         role: "SUPER_ADMIN"
//       };
//       return next();
//     }

//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }

//     if (!user.isActive) {
//       return res.status(403).json({ 
//         success: false,
//         message: "Account is disabled" 
//       });
//     }

//     req.user = {
//       id: user._id.toString(),
//       role: user.role,
//       email: user.email,
//       name: user.name
//     };

//     next();  
//   } catch (error) {
//     console.error("Auth middleware error:", error);
    
//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid token" 
//       });
//     }
    
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ 
//         success: false,
//         message: "Token expired" 
//       });
//     }

//     return res.status(500).json({ 
//       success: false,
//       message: "Authentication failed" 
//     });
//   }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Security = require('../models/security');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's SUPER_ADMIN (hardcoded login)
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
      // Security login
      const security = await Security.findById(decoded.id).populate('place');
      
      if (!security || !security.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Security account not found or disabled' 
        });
      }

      req.user = {
        id: security._id,
        role: 'SECURITY',
        email: security.email,
        placeId: decoded.placeId
      };
    } else {
      // Regular user login
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