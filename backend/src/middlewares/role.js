// const authorize = (...roles) => {
//   return (req, res, next) => {  
//     try {
//       if (!req.user || !req.user.role) {
//         return res.status(401).json({ 
//           success: false,
//           message: "Authentication required" 
//         });
//       }

//       if (!roles.includes(req.user.role)) {
//         return res.status(403).json({ 
//           success: false,
//           message: "Access denied. Insufficient permissions." 
//         });
//       }

//       next(); 
//     } catch (error) {
//       return res.status(500).json({ 
//         success: false,
//         message: error.message 
//       });
//     }
//   };
// };

// module.exports = authorize;
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

      if (req.user.role === "SECURITY") {
        req.security = req.user; 
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