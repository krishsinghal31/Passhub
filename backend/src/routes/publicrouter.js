// backend/src/routes/publicrouter.js
const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public");

// Home page - all events for public display
router.get("/home-events", publicController.getHomeEvents);

// Featured events
router.get("/featured-events", publicController.getFeaturedEvents);

// Categories
router.get("/categories", publicController.getCategories);

module.exports = router;