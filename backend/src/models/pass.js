// src/models/pass.js
const mongoose = require("mongoose");

const passSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },
    visitDate: {
      type: Date,
      required: true
    },
    guest: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
      },
      phone: {
        type: String,
        trim: true,
        default: null
      }
    },
    slotNumber: {
      type: Number,
      default: null
    },
    qrToken: {
      type: String,
      default: null
    },
    qrImage: {
      type: String,
      default: null
    },
    qrActive: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CANCELLED", "EXPIRED"],
      default: "PENDING"
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FREE", "REFUNDED", "FAILED"],
      default: "PENDING"
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ["NONE", "INITIATED", "COMPLETED", "FAILED"],
      default: "NONE"
    },
    refundSnapshot: {
      isRefundable: Boolean,
      beforeVisitPercent: Number,
      sameDayPercent: Number,
      description: String
    },
    checkInTime: {
      type: Date,
      default: null
    },
    checkOutTime: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

passSchema.index({ bookingId: 1 });
passSchema.index({ bookedBy: 1 });
passSchema.index({ place: 1, visitDate: 1 });
passSchema.index({ status: 1 });
passSchema.index({ qrToken: 1 }, { sparse: true }); 

// Virtual for visit duration
passSchema.virtual("visitDuration").get(function() {
  if (!this.checkInTime || !this.checkOutTime) {
    return null;
  }
  
  const duration = this.checkOutTime - this.checkInTime;
  return Math.round(duration / 60000); 
});

const Pass = mongoose.model("Pass", passSchema);

module.exports = Pass;