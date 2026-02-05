// backend/src/utils/adminemergencyhelper.js
const Pass = require("../models/pass");
const { initiateAutoRefund } = require("./refundhelper");
const { sendBulkCancellationMail } = require("../services/admincancelmail");

exports.cancelFuturePasses = async ({ filter, reason, cancelledBy }) => {
  try {
    const passes = await Pass.find(filter).populate("bookedBy place");

    console.log(`📊 Found ${passes.length} passes to cancel`);

    for (const pass of passes) {
      if (pass.status === "CANCELLED") {
        console.log(`⏭️ Pass ${pass._id} already cancelled, skipping`);
        continue;
      }

      pass.status = "CANCELLED";
      pass.qrActive = false;
      pass.cancelledAt = new Date();
      pass.cancellationReason = reason;
      await pass.save();

      console.log(`✅ Pass ${pass._id} cancelled`);

      await initiateAutoRefund(pass);

      if (pass.bookedBy?.email) {
        await sendBulkCancellationMail({
          to: pass.bookedBy.email,
          placeName: pass.place?.name || 'Unknown Place',
          visitDate: pass.visitDate,
          reason
        });
        console.log(`📧 Cancellation email sent to ${pass.bookedBy.email}`);
      }
    }

    console.log(`✅ All ${passes.length} passes cancelled and refunded`);
  } catch (error) {
    console.error("❌ Error in cancelFuturePasses:", error);
    throw error;
  }
};