// backend/src/controllers/hostsubscription.js
const SubscriptionPlan = require("../models/subscriptionplan");
const HostSubscription = require("../models/hostsubscription");
const User = require("../models/user");
const { sendPassEmail } = require("../services/email");

exports.purchaseSubscription = async (req, res) => {
  try {
    const { planId, startDate } = req.body;
    const userId = req.user.id;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid plan" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    const user = await User.findById(userId);
    
    user.subscription.planId = plan._id;
    user.subscription.isActive = plan.price === 0;
    user.subscription.startDate = start;
    user.subscription.endDate = end;
    user.subscription.amountPaid = plan.price;
    user.subscription.paymentStatus = plan.price === 0 ? "FREE" : "PENDING";
    
    await user.save();

    if (plan.price === 0) {
      if (user.email) {
        try {
          await sendPassEmail({
            to: user.email,
            subject: "Free Subscription Activated - PassHub",
            html: subscriptionConfirmationTemplate({
              userName: user.name,
              planName: plan.name,
              startDate: start,
              endDate: end,
              price: 0,
              daysRemaining: plan.durationDays
            })
          });
          console.log(`✅ Free subscription email sent to: ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send subscription email:`, emailError);
        }
      }

      return res.json({
        success: true,
        message: "Free subscription activated",
        subscription: user.subscription
      });
    }

    if (user.email) {
      try {
        await sendPassEmail({
          to: user.email,
          subject: "Complete Your Subscription Payment - PassHub",
          html: subscriptionPendingTemplate({
            userName: user.name,
            planName: plan.name,
            price: plan.price,
            durationDays: plan.durationDays
          })
        });
        console.log(`✅ Payment pending email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send payment email:`, emailError);
      }
    }

    res.json({
      success: true,
      message: "Proceed to payment",
      subscription: user.subscription,
      amountToPay: plan.price
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.confirmSubscriptionPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.body;

    const user = await User.findById(userId).populate('subscription.planId');
    
    if (!user || !user.subscription || !user.subscription.planId) {
      return res.status(404).json({
        success: false,
        message: "No pending subscription found"
      });
    }

    if (user.subscription.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: "Subscription already paid"
      });
    }

    user.subscription.isActive = true;
    user.subscription.paymentStatus = 'PAID';
    await user.save();

    if (user.email) {
      try {
        await sendPassEmail({
          to: user.email,
          subject: "Subscription Payment Confirmed - PassHub",
          html: subscriptionConfirmationTemplate({
            userName: user.name,
            planName: user.subscription.planId.name,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            price: user.subscription.amountPaid,
            daysRemaining: Math.ceil((new Date(user.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
            transactionId
          })
        });
        console.log(`✅ Subscription confirmation email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send confirmation email:`, emailError);
      }
    }

    res.json({
      success: true,
      message: "Subscription activated successfully",
      subscription: {
        planName: user.subscription.planId.name,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        isActive: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};