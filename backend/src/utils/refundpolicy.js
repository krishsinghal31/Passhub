// backend/src/utils/refundpolicy.js
function calculateRefundAmount(pass, place) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visitDate = new Date(pass.visitDate);
  visitDate.setHours(0, 0, 0, 0);

  if (!place.refundPolicy?.isRefundable) {
    console.log(`❌ Non-refundable policy for place ${place._id}`);
    return 0;
  }

  if (pass.checkInTime) {
    console.log(`❌ Pass ${pass._id} already checked in`);
    return 0;
  }

  if (visitDate < today) {
    console.log(`❌ Visit date ${visitDate} is in the past`);
    return 0;
  }

  if (pass.status === "EXPIRED") {
    console.log(`❌ Pass ${pass._id} is expired`);
    return 0;
  }

  if (visitDate.getTime() === today.getTime()) {
    const refund = Math.floor(pass.amountPaid * (place.refundPolicy.sameDayPercent || 50) / 100);
    console.log(`📅 Same day cancellation: ${place.refundPolicy.sameDayPercent}% = ₹${refund}`);
    return refund;
  }

  const refund = Math.floor(pass.amountPaid * (place.refundPolicy.beforeVisitPercent || 80) / 100);
  console.log(`📅 Before visit cancellation: ${place.refundPolicy.beforeVisitPercent}% = ₹${refund}`);
  return refund;
}

module.exports = { calculateRefundAmount };
