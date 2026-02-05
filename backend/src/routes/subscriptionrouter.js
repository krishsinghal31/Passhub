// backend/src/routes/subscriptionrouter.js
const router = require("express").Router();
const { createPlan, getPlans, togglePlan, getApplicablePlans } = require("../controllers/subscription");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

router.post("/", auth, authorize("SUPER_ADMIN"), createPlan);
router.get("/", getPlans);
router.get("/applicable", auth, getApplicablePlans);
router.patch("/:planId/toggle", auth, authorize("SUPER_ADMIN"), togglePlan);

module.exports = router;