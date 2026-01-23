const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Security = require("../models/security");

// Security login
exports.loginAsSecurity = async (req, res) => {
  try {
    const { email, password, placeId } = req.body;

    if (!email || !password || !placeId) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, password, and event are required" 
      });
    }

    // Find security assigned to this place
    const security = await Security.findOne({ 
      email: email.toLowerCase(), 
      place: placeId,
      isActive: true 
    }).populate('place', 'name');

    if (!security) {
      return res.status(404).json({ 
        success: false, 
        message: "You are not assigned as security for this event" 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, security.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid password" 
      });
    }

    // Check if assignment is still active
    if (security.assignmentPeriod && security.assignmentPeriod.end) {
      const now = new Date();
      const endDate = new Date(security.assignmentPeriod.end);
      if (now > endDate) {
        return res.status(403).json({ 
          success: false, 
          message: "Your security assignment has expired" 
        });
      }
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: security._id, 
        role: 'SECURITY', 
        placeId: security.place._id,
        email: security.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      security: {
        id: security._id,
        email: security.email,
        place: security.place.name,
        placeId: security.place._id
      }
    });
  } catch (error) {
    console.error("Security login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New passwords do not match" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters" 
      });
    }

    // Get security from token (set by authMiddleware)
    const security = await Security.findById(req.user.id);

    if (!security) {
      return res.status(404).json({ 
        success: false, 
        message: "Security account not found" 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, security.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    security.passwordHash = hashedPassword;
    await security.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};