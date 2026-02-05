// src/models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: "INR"
  },
  gateway: {
    type: String,
    enum: ["RAZORPAY", "STRIPE", "UPI"],
    default: "RAZORPAY",
    index: true
  },
  status: {
    type: String,
    enum: ["CREATED", "PAID", "FAILED"],
    default: "CREATED"
  },
  transactionId: {
    type: String,
    sparse: true
  },
  paymentDate: Date,
  refundDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);