// src/models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,  
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["VISITOR", "HOST", "ADMIN", "SUPER_ADMIN"],
      default: "VISITOR"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isHostingDisabled: {
      type: Boolean,
      default: false
    },
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        default: null
      },
      isActive: {
        type: Boolean,
        default: false
      },
      startDate: {
        type: Date,
        default: null
      },
      endDate: {
        type: Date,
        default: null
      },
      amountPaid: {
        type: Number,
        default: 0
      },
      paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FREE", "FAILED"],
        default: "PENDING"
      }
    }
  },
  {
    timestamps: true
  }
);

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to check if subscription is active
userSchema.methods.hasActiveSubscription = function() {
  if (!this.subscription || !this.subscription.isActive) {
    return false;
  }
  
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  
  return now <= endDate;
};

// Method to get subscription days remaining
userSchema.methods.getSubscriptionDaysRemaining = function() {
  if (!this.subscription || !this.subscription.endDate) {
    return 0;
  }
  
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  
  if (now > endDate) {
    return 0;
  }
  
  const diffTime = Math.abs(endDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

module.exports = mongoose.model("User", userSchema);