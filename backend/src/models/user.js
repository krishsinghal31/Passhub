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
      enum: ["VISITOR", "HOST", "ADMIN", "SUPER_ADMIN", "SECURITY"],
      default: "VISITOR"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isHostingDisabled: {
      type: Boolean,
      default: false
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



module.exports = mongoose.model("User", userSchema);