// backend/src/services/eventCompletionService.js
const Place = require("../models/place");
const Pass = require("../models/pass");
const User = require("../models/user");
const { sendPassEmail } = require("./email");

async function checkAndCompleteEvents() {
  try {
    const now = new Date();
    // Find events that have ended but haven't sent summary emails yet
    const endedEvents = await Place.find({
      "eventDates.end": { $lt: now },
      isSummaryEmailSent: false,
      status: { $ne: "CANCELLED" }
    }).populate("host", "name email");

    if (endedEvents.length === 0) {
      return;
    }

    console.log(`[EVENT COMPLETION] Found ${endedEvents.length} events to complete and summarize.`);

    for (const event of endedEvents) {
      const passes = await Pass.find({ place: event._id });
      
      const totalTicketsSold = passes.filter(p => p.status !== "PENDING").length;
      
      let totalMoneyCollected = 0;
      let totalRefundMoney = 0;
      let cancellationRevenue = 0;

      for (const pass of passes) {
        if (pass.status !== "PENDING") {
          totalMoneyCollected += pass.amountPaid || 0;
        }
        if (pass.paymentStatus === "REFUNDED" || pass.refundStatus === "COMPLETED") {
          totalRefundMoney += pass.refundAmount || 0;
        }
        if (pass.status === "CANCELLED" && pass.paymentStatus === "REFUNDED") {
          const kept = (pass.amountPaid || 0) - (pass.refundAmount || 0);
          if (kept > 0) {
            cancellationRevenue += kept;
          }
        }
      }

      const netProfit = Math.max(0, totalMoneyCollected - totalRefundMoney);
      
      // Load rates from env (with defaults)
      const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 5;
      const gatewayFeePercent = parseFloat(process.env.PAYMENT_GATEWAY_FEE_PERCENT) || 2;
      
      const platformFee = Math.round(netProfit * platformFeePercent / 100);
      const gatewayFee = Math.round(totalMoneyCollected * gatewayFeePercent / 100);
      const remainingMoney = Math.max(0, netProfit - platformFee - gatewayFee);

      // Format host payout details
      let payoutDetailsHtml = "";
      if (event.payoutDetails && event.payoutDetails.accountNumber) {
        payoutDetailsHtml = `
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #1e293b;">Bank Payout Account</h3>
            <p style="margin: 5px 0;"><strong>Holder Name:</strong> ${event.payoutDetails.accountHolderName}</p>
            <p style="margin: 5px 0;"><strong>Bank Name:</strong> ${event.payoutDetails.bankName}</p>
            <p style="margin: 5px 0;"><strong>Account Number:</strong> ${event.payoutDetails.accountNumber}</p>
            <p style="margin: 5px 0;"><strong>IFSC Code:</strong> ${event.payoutDetails.ifscCode}</p>
          </div>
        `;
      } else {
        payoutDetailsHtml = `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5; margin-top: 20px;">
            <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ Warning: No payout account details found.</p>
            <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;">Please update your event settings with valid bank details to receive your money.</p>
          </div>
        `;
      }

      const emailContent = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0;">Event Completed & Summary Report</h2>
            <p style="color: #38bdf8; margin: 5px 0 0 0; font-size: 14px;">"${event.name}"</p>
          </div>
          <div style="background: white; padding: 35px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
            <p>Dear ${event.host?.name || "Host"},</p>
            <p>Congratulations! Your hosted event <strong>"${event.name}"</strong> has completed successfully. Here is the financial summary statement:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold;">Total Tickets Sold:</td>
                <td style="padding: 10px 0; text-align: right;">${totalTicketsSold}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold;">Total Revenue Collected:</td>
                <td style="padding: 10px 0; text-align: right; color: #16a34a;">₹${totalMoneyCollected}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold;">Total Refunded Amount:</td>
                <td style="padding: 10px 0; text-align: right; color: #dc2626;">₹${totalRefundMoney}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold;">Retained Cancellation Fees (20%/50%):</td>
                <td style="padding: 10px 0; text-align: right;">₹${cancellationRevenue}</td>
              </tr>
              <tr style="border-bottom: 2px solid #cbd5e1; background-color: #f8fafc;">
                <td style="padding: 10px; font-weight: bold;">Net Profit:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₹${netProfit}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #64748b;">Platform Fee (5%):</td>
                <td style="padding: 10px 0; text-align: right; color: #dc2626;">- ₹${platformFee}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #64748b;">Payment Gateway Fee (2%):</td>
                <td style="padding: 10px 0; text-align: right; color: #dc2626;">- ₹${gatewayFee}</td>
              </tr>
              <tr style="background-color: #f0fdf4; border-top: 2px solid #16a34a;">
                <td style="padding: 12px; font-weight: bold; font-size: 16px; color: #166534;">Payout Amount:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #166534;">₹${remainingMoney}</td>
              </tr>
            </table>

            ${payoutDetailsHtml}

            <p style="margin-top: 25px;"><strong>Note:</strong> Since the automatic payout transfer is enabled, the payout has been scheduled. Your remaining money will be credited to your bank account within 24 hours.</p>
            <p>Thank you for using PassHub!</p>
          </div>
        </body>
        </html>
      `;

      if (event.host?.email) {
        try {
          await sendPassEmail({
            to: event.host.email,
            subject: `Event Summary & Payout Details - ${event.name}`,
            html: emailContent,
            type: "host"
          });
        } catch (emailError) {
          console.error(`[EVENT COMPLETION ERROR] Email failed for place ${event._id}:`, emailError.message);
        }
      }

      event.status = "COMPLETED";
      event.isSummaryEmailSent = true;
      await event.save();
      console.log(`[EVENT COMPLETION] Event "${event.name}" marked completed and summary email dispatched.`);
    }
  } catch (error) {
    console.error("[EVENT COMPLETION ERROR] checkCompletedEvents failed:", error);
  }
}

// Start the check interval
function initEventCompletionScheduler() {
  // Run on startup
  setTimeout(checkAndCompleteEvents, 5000);
  // Run once every hour
  setInterval(checkAndCompleteEvents, 60 * 60 * 1000);
}

module.exports = {
  checkAndCompleteEvents,
  initEventCompletionScheduler
};
