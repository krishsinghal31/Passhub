// src/models/security.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const securitySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignmentPeriod: {
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required: true
      }
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING"
    },
    isActive: {
      type: Boolean,
      default: false
    },
    invitationSentAt: {
      type: Date,
      default: Date.now
    },
    invitationAcceptedAt: {
      type: Date,
      default: null
    },
    firstLoginAt: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0
    },
    passwordChangedAt: {
      type: Date,
      default: null
    },
    removedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes defined ONLY here
securitySchema.index({ email: 1, place: 1 }, { unique: true });
securitySchema.index({ place: 1, isActive: 1 });

// Method to compare passwords
securitySchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

module.exports = mongoose.model("Security", securitySchema);