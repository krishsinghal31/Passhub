// backend/src/controllers/subscription.js
const SubscriptionPlan = require("../models/subscriptionplan");

exports.createPlan = async (req, res) => {
  try {
    const { name, price, durationDays, description, features } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      price,
      durationDays,
      description,
      features,
      isActive: true
    });

    res.status(201).json({ 
      success: true,
      message: "Subscription plan created",
      plan 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    
    res.json({ 
      success: true,
      count: plans.length,
      plans 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getApplicablePlans = async (req, res) => {
  try {
    const { durationDays } = req.query;

    if (!durationDays) {
      return res.status(400).json({ 
        success: false,
        message: "Duration days required" 
      });
    }

    const plans = await SubscriptionPlan.find({
      durationDays: { $gte: Number(durationDays) },
      isActive: true
    }).sort({ price: 1 });

    res.json({ 
      success: true,
      count: plans.length,
      plans 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.togglePlan = async (req, res) => {
  try {
    const { planId } = req.params; 
    
    const plan = await SubscriptionPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false,
        message: "Plan not found" 
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({ 
      success: true,
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'}`,
      plan 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};