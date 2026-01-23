const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("🔧 ENV CHECK:", {
  JWT_SECRET: !!process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  MONGO_URI: !!process.env.MONGO_URI,
  MAIL_USER: !!process.env.MAIL_USER
});

const authRouter = require("./routes/authrouter");
const passRouter = require("./routes/passrouter");
const adminRouter = require("./routes/adminrouter");
const hostRouter = require("./routes/hostrouter");
const placeRouter = require("./routes/placerouter");
const securityRouter = require("./routes/securityrouter");
const analyticsRouter = require("./routes/analyticsrouter");
const subscriptionRouter = require("./routes/subscriptionrouter");
const hostSubscriptionRouter = require("./routes/hostsubscription");
const publicRouter = require("./routes/publicrouter");

const seedSuperAdmin = require("./services/createadmin");

const app = express();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
// ✅ ADDED: Public routes (no authentication needed)
app.use("/api/public", publicRouter);

app.use("/api/auth", authRouter);
app.use("/api/passes", passRouter);
app.use("/api/admin", adminRouter);
app.use("/api/host", hostRouter);
app.use("/api/places", placeRouter);
app.use("/api/security", securityRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/host-subscription", hostSubscriptionRouter);

app.get("/", (req, res) => {
  res.json({ 
    message: "🎫 Visitor Pass Management System Running",
    version: "2.0",
    endpoints: {
      public: "/api/public",
      auth: "/api/auth",
      passes: "/api/passes",
      admin: "/api/admin",
      host: "/api/host",
      places: "/api/places",
      security: "/api/security",
      analytics: "/api/analytics",
      subscriptions: "/api/subscriptions",
      hostSubscription: "/api/host-subscription"
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.path 
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    
    await seedSuperAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });

module.exports = app;