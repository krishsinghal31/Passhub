// backend/src/utils/refundhelper.js
const Pass = require("../models/pass");
const { calculateRefundAmount } = require("./refundpolicy");

exports.initiateAutoRefund = async (pass) => {
  try {
    if (pass.paymentStatus !== "PAID") {
      console.log(`⏭️ Pass ${pass._id} not paid, skipping refund`);
      return;
    }

    if (pass.refundStatus !== "NONE") {
      console.log(`⏭️ Pass ${pass._id} already has refund status ${pass.refundStatus}`);
      return;
    }

    const refundAmount = calculateRefundAmount(pass, pass.place);

    pass.refundAmount = refundAmount;
    pass.refundStatus = refundAmount > 0 ? "INITIATED" : "NONE";
    pass.paymentStatus = refundAmount > 0 ? "REFUNDED" : pass.paymentStatus;

    await pass.save();

    console.log(`✅ Refund initiated for pass ${pass._id}: ₹${refundAmount}`);
  } catch (error) {
    console.error(`❌ Error initiating refund for pass ${pass._id}:`, error);
    throw error;
  }
};
