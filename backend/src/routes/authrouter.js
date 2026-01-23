// backend/routes/authrouter.js 
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateProfile } = require("../controllers/auth");
const authMiddleware = require("../middlewares/auth");
const User = require("../models/user");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("subscription.planId");
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;