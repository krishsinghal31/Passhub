// backend/src/routes/hostsubscription.js
const router = require("express").Router();
const { purchaseSubscription, confirmSubscriptionPayment } = require("../controllers/hostsubscription");
const auth = require("../middlewares/auth");

router.post("/purchase", auth, purchaseSubscription);
router.post("/confirm-payment", auth, confirmSubscriptionPayment); 

module.exports = router;