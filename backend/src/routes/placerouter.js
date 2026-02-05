// backend/src/routes/placerouter.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/role");
const placeController = require("../controllers/place");

router.get("/search", placeController.searchPlaces);

// Get all active places (public)
router.get("/", placeController.getAllPlaces);

// Get single place details (public)
router.get("/:placeId", placeController.getPlaceById);

module.exports = router;