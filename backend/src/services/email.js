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
  pool: true, // Enable connection pooling
  maxConnections: 5, // Max concurrent connections
  maxMessages: 100, // Max messages per connection
  rateDelta: 1000, // Minimum time between messages (1 second)
  rateLimit: 5, // Max 5 messages per rateDelta
  tls: {
    rejectUnauthorized: false // Add if you're having SSL issues
  },
  debug: false, 
  logger: false 
});

// Add connection verification
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

exports.sendPassEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Visitor Pass System" <${process.env.MAIL_USER || user}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

exports.sendCancellationEmail = async ({ to, subject, html, type = 'visitor' }) => {
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
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

exports.sendBulkCancellationEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const info = await exports.sendCancellationEmail(email);
      results.push({ email: email.to, success: true, messageId: info?.messageId });
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ email: email.to, success: false, error: error.message });
    }
  }
  
  return results;
};

exports.sendSecurityCredentials = async ({ to, password, placeName, placeId }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const loginLink = `${frontendUrl}/places/${placeId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #4f46e5; margin-top: 0;">🔐 Security Assignment</h2>
        <p style="font-size: 16px; color: #374151;">You have been assigned as <strong>Security Personnel</strong> for:</p>
        <h3 style="color: #1f2937; background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">${placeName}</h3>
        
        <div style="background-color: #eff6ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4f46e5;">
          <h4 style="margin-top: 0; color: #1e40af;">Your Login Credentials:</h4>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 10px 0;"><strong>Password:</strong></p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; text-align: center; border: 2px dashed #4f46e5; margin-top: 10px;">
            <code style="font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: 2px;">${password}</code>
          </div>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>⚠️ Important:</strong> Please change your password after your first login for security.
          </p>
        </div>

        <h4 style="color: #1f2937;">How to Login:</h4>
        <ol style="color: #374151; line-height: 1.8;">
          <li>Click the button below to go to the event page</li>
          <li>Click on <strong>"Enter as Security"</strong> button</li>
          <li>Login with your email and the password above</li>
          <li>Change your password from the dashboard</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" style="
            display: inline-block;
            padding: 15px 40px;
            background-color: #10b981;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          ">
            🔓 Go to Event Page
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6b7280; text-align: center; margin-bottom: 0;">
          If you did not expect this assignment, please contact the event organizer.<br>
          This is an automated email from PassHub Event Management System.
        </p>
      </div>
    </div>
  `;

  await sendPassEmail({
    to,
    subject: `🔐 Security Assignment – ${placeName}`,
    html
  });
};