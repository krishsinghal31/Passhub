// src/models/scanlog.js
const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema(
  {
    pass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pass",
      required: true
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    scanType: {
      type: String,
      enum: ["ENTRY", "EXIT"],
      required: true
    },
    scannedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true
    },
    failureReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

scanLogSchema.index({ place: 1, scannedAt: -1 });
scanLogSchema.index({ scannedBy: 1, scannedAt: -1 });
scanLogSchema.index({ pass: 1 });
scanLogSchema.index({ scanType: 1, scannedAt: -1 });

const ScanLog = mongoose.model("ScanLog", scanLogSchema);

module.exports = ScanLog;