// src/models/place.js
const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: ""
    }, 
    category: {
      type: String,
      default: "general"
    }, 
    tags: {
      type: [String],
      default: []
    }, 
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    }, 
    featured: {
      type: Boolean,
      default: false
    }, 
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    eventDates: {
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required: true
      }
    },
    hostingValidity: {
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required: true
      }
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    dailyCapacity: {
      type: Number,
      required: true,
      min: 1
    },
    refundPolicy: {
      isRefundable: {
        type: Boolean,
        default: true
      },
      beforeVisitPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 80
      },
      sameDayPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      },
      description: {
        type: String,
        default: "Standard refund policy"
      }
    },
    isBookingEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
placeSchema.index({ host: 1 });
placeSchema.index({ "eventDates.start": 1, "eventDates.end": 1 });
placeSchema.index({ isBookingEnabled: 1 });
placeSchema.index({ featured: 1 }); 
placeSchema.index({ category: 1 }); 

placeSchema.virtual("isEventActive").get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(this.eventDates.start);
  const end = new Date(this.eventDates.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return today >= start && today <= end;
});

placeSchema.virtual("isHostingValid").get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(this.hostingValidity.start);
  const end = new Date(this.hostingValidity.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return today >= start && today <= end;
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;