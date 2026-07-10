// backend/src/services/email.js

const nodemailer = require("nodemailer");
const { user, password, host, port } = require("../config/mail");

const transporter = nodemailer.createTransport({
  host: host || "smtp.gmail.com",
  port: Number(port || 587),
  secure: Number(port) === 465,
  auth: { user, pass: password }
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

const sendPassEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const formattedAttachments = (attachments || []).map((a) => {
      let content = a.content;
      if (typeof a.content === "string" && (a.encoding === "base64" || !a.encoding)) {
        content = Buffer.from(a.content, "base64");
      }
      return {
        filename: a.filename,
        content,
        cid: a.cid
      };
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Visitor Pass System" <${user}>`,
      to,
      subject,
      html,
      attachments: formattedAttachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
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

    const info = await sendPassEmail({
      to,
      subject,
      html
    });

    console.log(`✅ Cancellation email sent to ${to}`);
    return { messageId: info?.messageId || `smtp-${Date.now()}` };
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
