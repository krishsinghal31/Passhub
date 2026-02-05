// backend/src/services/email.js

const nodemailer = require("nodemailer");
const { user, password } = require("../config/mail");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: user,
    pass: password
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// --- DEFINE FUNCTIONS AS LOCAL CONSTANTS SO THEY CAN SEE EACH OTHER ---

const sendPassEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: `"PassHub" <${process.env.MAIL_USER || user}>`,
      to,
      subject,
      html,
      attachments
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

const sendCancellationEmail = async ({ to, subject, html, type = 'visitor' }) => {
  try {
    if (!to) {
      console.log('⚠️ No recipient email provided for cancellation');
      return null;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Visitor Pass System" <${process.env.MAIL_USER || user}>`,
      to,
      subject,
      html,
      headers: {
        'X-Cancellation-Type': type,
        'X-Auto-Response-Suppress': 'All'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Cancellation email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send cancellation email to ${to}:`, error);
    throw error;
  }
};

const sendSecurityCredentials = async ({ to, password, placeName }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
        <h2 style="color: white; margin: 0;">Staff Invitation</h2>
      </div>
      <div style="padding: 30px; color: #374151;">
        <p>You have been assigned as Security for <strong>${placeName}</strong>.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px dashed #4f46e5; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Temporary Password:</p>
          <code style="font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: 2px;">${password}</code>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${frontendUrl}" style="background-color: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
            Get Started / Sign In
          </a>
        </div>
        
        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
          Please log in and change your password immediately.
        </p>
      </div>
    </div>
  `;

  await sendPassEmail({
    to,
    subject: `Security Assignment: ${placeName}`,
    html
  });
};

exports.sendPassEmail = sendPassEmail;
exports.sendCancellationEmail = sendCancellationEmail;
exports.sendSecurityCredentials = sendSecurityCredentials;
exports.sendBulkCancellationEmails = async (emails) => {
  const results = [];
  for (const email of emails) {
    try {
      const info = await sendCancellationEmail(email);
      results.push({ email: email.to, success: true, messageId: info?.messageId });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ email: email.to, success: false, error: error.message });
    }
  }
  return results;
};
