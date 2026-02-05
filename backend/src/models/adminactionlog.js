// src/models/adminactionlog.js
const mongoose = require("mongoose");

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      enum: ["DISABLE_HOST", "CANCEL_EVENT", "INVITE_ADMIN", "DISABLE_ADMIN"],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reason: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

adminActionLogSchema.index({ admin: 1, createdAt: -1 });
adminActionLogSchema.index({ action: 1, createdAt: -1 });
adminActionLogSchema.index({ targetId: 1 });

const AdminActionLog = mongoose.model("AdminActionLog", adminActionLogSchema);

module.exports = AdminActionLog;