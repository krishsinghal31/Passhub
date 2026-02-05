// backend/src/services/admincancelmail.js
const { sendPassEmail } = require("./email");

exports.sendBulkCancellationMail = async ({ to, placeName, visitDate, reason }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Event Cancelled</h2>
      <p>Dear Visitor,</p>
      <p>We regret to inform you that <strong>${placeName}</strong> scheduled on <strong>${visitDate.toDateString()}</strong> has been cancelled.</p>
      
      <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
      </div>
      
      <p>Your refund has been initiated and will be processed within 3-5 business days.</p>
      <p>We sincerely apologize for the inconvenience caused.</p>
      
      <p style="margin-top: 30px;">If you have any questions, please contact support.</p>
      
      <p style="margin-top: 20px;">Best regards,<br/>Visitor Pass Management Team</p>
    </div>
  `;

  await sendPassEmail({
    to,
    subject: `Event Cancelled – ${placeName}`,
    html
  });
};

exports.sendHostDisabledMail = async ({ to, reason }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Hosting Access Disabled</h2>
      <p>Dear Host,</p>
      <p>Your hosting access has been disabled by the administration.</p>
      
      <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
      </div>
      
      <p>All your future events have been cancelled and visitors will be refunded.</p>
      <p>If you believe this is a mistake, please contact support immediately.</p>
      
      <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
    </div>
  `;

  await sendPassEmail({
    to,
    subject: "Hosting Access Disabled",
    html
  });
};

exports.sendEventCancelledMail = async ({ to, placeName, reason }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Event Cancelled by Admin</h2>
      <p>Dear Host,</p>
      <p>Your event <strong>${placeName}</strong> has been cancelled by the administration.</p>
      
      <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
      </div>
      
      <p>All visitors have been notified and refunds have been initiated.</p>
      <p>If you have any concerns, please contact support.</p>
      
      <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
    </div>
  `;

  await sendPassEmail({
    to,
    subject: `Event Cancelled – ${placeName}`,
    html
  });
};

exports.notifyAdminEventCancelled = async ({ hostId, hostName, placeId, placeName, reason, totalRefunds, affectedVisitors }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Host Event Cancellation Notification</h2>
      <p>A host has cancelled their event. Details below:</p>
      <ul>
        <li><strong>Host:</strong> ${hostName} (ID: ${hostId})</li>
        <li><strong>Event:</strong> ${placeName} (ID: ${placeId})</li>
        <li><strong>Reason:</strong> ${reason}</li>
        <li><strong>Total Refunds:</strong> ₹${totalRefunds}</li>
        <li><strong>Affected Visitors:</strong> ${affectedVisitors}</li>
      </ul>
      <p>Please review if necessary.</p>
    </div>
  `;

  await sendPassEmail({
    to: process.env.ADMIN_EMAIL || "admin@passhub.com", // Set in env
    subject: `Host Event Cancelled - ${placeName}`,
    html
  });
};