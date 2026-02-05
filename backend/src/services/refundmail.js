// backend/src/services/refundmail.js
const { sendPassEmail } = require("./email");

const refundInitiatedMail = async (bookerEmail, bookingId, refundAmount, passes) => {
  const passDetails = passes
    .map(p => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px;">${p.guest?.name || 'N/A'}</td>
        <td style="padding: 10px;">${p.place?.name || 'N/A'}</td>
        <td style="padding: 10px;">${new Date(p.visitDate).toDateString()}</td>
        <td style="padding: 10px;">Slot ${p.slotNumber || 'N/A'}</td>
        <td style="padding: 10px;">₹${p.refundAmount || 0}</td>
      </tr>
    `)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #f59e0b;">Refund Initiated</h2>
      <p>Dear Customer,</p>
      <p>Your refund request for Booking ID <strong>${bookingId}</strong> has been initiated.</p>
      
      <h3>Cancelled Passes:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Guest</th>
            <th style="padding: 10px; text-align: left;">Place</th>
            <th style="padding: 10px; text-align: left;">Date</th>
            <th style="padding: 10px; text-align: left;">Slot</th>
            <th style="padding: 10px; text-align: left;">Refund</th>
          </tr>
        </thead>
        <tbody>
          ${passDetails}
        </tbody>
      </table>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Total Refund Amount:</strong> ₹${refundAmount}</p>
      </div>
      
      <p>The refund will be processed within 3-5 business days.</p>
      
      <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
    </div>
  `;

  await sendPassEmail({ to: bookerEmail, subject: `Refund Initiated - Booking #${bookingId}`, html });
};

const refundCompletedMail = async (bookerEmail, bookingId, refundedAmount, passes) => {
  const passDetails = passes
    .map(p => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px;">${p.guest?.name || 'N/A'}</td>
        <td style="padding: 10px;">${p.place?.name || 'N/A'}</td>
        <td style="padding: 10px;">${new Date(p.visitDate).toDateString()}</td>
        <td style="padding: 10px;">₹${p.refundAmount || 0}</td>
      </tr>
    `)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #10b981;">Refund Completed</h2>
      <p>Dear Customer,</p>
      <p>Your refund for Booking ID <strong>${bookingId}</strong> has been successfully completed.</p>
      
      <h3>Refunded Passes:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Guest</th>
            <th style="padding: 10px; text-align: left;">Place</th>
            <th style="padding: 10px; text-align: left;">Date</th>
            <th style="padding: 10px; text-align: left;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${passDetails}
        </tbody>
      </table>
      
      <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Total Refunded:</strong> ₹${refundedAmount}</p>
      </div>
      
      <p>Thank you for using our service.</p>
      
      <p style="margin-top: 30px;">Best regards,<br/>Visitor Pass Management Team</p>
    </div>
  `;

  await sendPassEmail({ to: bookerEmail, subject: `Refund Completed - Booking #${bookingId}`, html });
};

exports.eventCancellationRefundMail = async (email, data) => {
  const { bookingId, placeName, reason, refundAmount, passes } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Event Cancelled - Full Refund Initiated - ${placeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">⚠️ Event Cancelled</h2>
        
        <p>We regret to inform you that the following event has been cancelled:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${placeName}</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>

        <h3>📝 Cancelled Passes:</h3>
        <ul>
          ${passes.map(p => `
            <li>
              <strong>${p.guestName}</strong> - ${p.visitDate}
              <br/>Refund: ₹${p.refundAmount}
            </li>
          `).join('')}
        </ul>

        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #155724; margin-top: 0;">💰 Full Refund Initiated</h3>
          <p style="margin: 0;">
            <strong>Refund Amount:</strong> ₹${refundAmount} (100% of booking amount)
            <br/><strong>Processing Time:</strong> 3-5 business days
            <br/><strong>Refund Method:</strong> Original payment method
          </p>
        </div>

        <p>We sincerely apologize for the inconvenience. Your refund is being processed and will be credited within 3-5 business days.</p>

        <p>If you have any questions, please contact our support team.</p>

        <p>Best regards,<br/>Event Management Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.hostEventCancelledMail = async (email, data) => {
  const { placeName, reason, totalRefunds, affectedVisitors, cancelledBy, date } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your Event Has Been Cancelled - ${placeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Event Cancelled</h2>
        
        <p>Your event <strong>${placeName}</strong> has been cancelled.</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cancelled By:</strong> ${cancelledBy}</p>
          <p><strong>Date:</strong> ${date.toLocaleString()}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>

        <h3>Impact Summary:</h3>
        <ul>
          <li>Affected Visitors: ${affectedVisitors}</li>
          <li>Total Refunds: ₹${totalRefunds}</li>
          <li>Refund Percentage: 100%</li>
        </ul>

        <p>All affected visitors have been notified and will receive 100% refunds within 3-5 business days.</p>

        <p>Best regards,<br/>Event Management Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
module.exports = { refundInitiatedMail, refundCompletedMail };