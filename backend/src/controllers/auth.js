// backend/src/controllers/auth.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const SubscriptionPlan = require("../models/subscriptionplan");
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

    let defaultPlan = await SubscriptionPlan.findOne({ 
      name: "Default 7-Day", 
      price: 0 
    });
    
    if (!defaultPlan) {
      defaultPlan = await SubscriptionPlan.create({
        name: "Default 7-Day",
        price: 0,
        durationDays: 7,
        isActive: true,
        description: "Free 7-day hosting for new users"
      });
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,  // ✅ Already hashed
      role: role || 'VISITOR',
      subscription: {
        planId: defaultPlan._id,
        isActive: true,
        startDate: now,
        endDate: endDate,
        amountPaid: 0,
        paymentStatus: 'FREE'
      }
    });

    const token = generateToken(user);
    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User registered successfully with 7-day free hosting",
      user,
      token,
      subscription: {
        plan: "Default 7-Day",
        validUntil: endDate,
        daysRemaining: 7
      }
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
    const user = await User.findOne({ email }).populate('subscription.planId');
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

    const now = new Date();
    const subEnd = new Date(user.subscription.endDate);
    const daysRemaining = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));

    res.json({ 
      success: true,
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email,
      subscription: {
        isActive: user.subscription.isActive && now <= subEnd,
        planName: user.subscription.planId?.name || "Default",
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        endDate: user.subscription.endDate
      }
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
          role: "SUPER_ADMIN",
          subscription: { isActive: false }
        }
      });
    }
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('subscription.planId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate subscription days remaining
    let daysRemaining = 0;
    if (user.subscription && user.subscription.endDate) {
      const now = new Date();
      const endDate = new Date(user.subscription.endDate);
      daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id, // Include both for compatibility
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: {
          ...user.subscription.toObject(),
          daysRemaining: Math.max(0, daysRemaining),
          planName: user.subscription.planId?.name || 'Default'
        }
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