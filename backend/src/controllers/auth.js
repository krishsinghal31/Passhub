// backend/src/controllers/auth.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { generateToken } = require("../services/token");

const registerUser = async(req,res)=>{
  try{
    const {name,email,password,role} = req.body;
    
    if(!name || !email || !password){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const exist = await User.findOne({email});
    if(exist){
      return res.status(409).json({
        success: false,
        message: "User already exists!"
      });
    }

    // ✅ Hash password BEFORE creating user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,  // ✅ Already hashed
      role: role || 'VISITOR'
    });

    const token = generateToken(user);
    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const loginUser = async(req,res)=>{
  const { email, password } = req.body;

  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { id: "SUPER_ADMIN", role: "SUPER_ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL
    });
  }
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      success: true,
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
}

const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    // Handle SUPER_ADMIN specially
    if (userId === "SUPER_ADMIN") {
      return res.json({
        success: true,
        user: {
          id: "SUPER_ADMIN",
          _id: "SUPER_ADMIN",
          name: "Super Admin",
          email: process.env.SUPER_ADMIN_EMAIL || "admin@passhub.com",
          role: "SUPER_ADMIN"
        }
      });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id, // Include both for compatibility
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    if (user.status === 'PENDING') user.status = 'ACTIVE';
    
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updatePassword
};