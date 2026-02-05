// src/models/booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    visitor: {
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
    guestCount: {
      type: Number,
      required: true,
      min: 1
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING"
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FREE", "REFUNDED", "FAILED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ visitor: 1 });
bookingSchema.index({ place: 1, visitDate: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;