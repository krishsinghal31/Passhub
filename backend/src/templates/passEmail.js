// backend/templates/passEmail.js 

exports.passEmailTemplate = ({ guest, place, visitDate, passes }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const passesHTML = passes.map((pass, index) => `
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 15px; margin: 20px 0; border: 2px solid #4F46E5;">
      <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
        <h3 style="margin: 0 0 15px 0; color: #4F46E5; font-size: 20px;">Pass ${index + 1} - ${pass.guest.name}</h3>
        
        <table style="width: 100%; margin-bottom: 15px;">
          <tr>
            <td style="padding: 8px 0;">
              <strong style="color: #6B7280;">Guest Name:</strong>
            </td>
            <td style="padding: 8px 0; text-align: right;">
              <span style="color: #1F2937;">${pass.guest.name}</span>
            </td>
          </tr>
          ${pass.guest.email ? `
          <tr>
            <td style="padding: 8px 0;">
              <strong style="color: #6B7280;">Email:</strong>
            </td>
            <td style="padding: 8px 0; text-align: right;">
              <span style="color: #1F2937;">${pass.guest.email}</span>
            </td>
          </tr>
          ` : ''}
          ${pass.slotNumber ? `
          <tr>
            <td style="padding: 8px 0;">
              <strong style="color: #6B7280;">Slot Number:</strong>
            </td>
            <td style="padding: 8px 0; text-align: right;">
              <span style="color: #4F46E5; font-size: 18px; font-weight: bold;">#${pass.slotNumber}</span>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;">
              <strong style="color: #6B7280;">Status:</strong>
            </td>
            <td style="padding: 8px 0; text-align: right;">
              <span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${pass.status}</span>
            </td>
          </tr>
        </table>
      </div>

      ${pass.qrImage ? `
  <div style="background: white; padding: 25px; border-radius: 10px; text-align: center;">
    <p style="margin: 0 0 15px 0; color: #6B7280; font-size: 14px; font-weight: bold;">SCAN THIS QR CODE AT ENTRANCE</p>
    <div style="background: white; display: inline-block; padding: 15px; border: 3px solid #4F46E5; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <img 
        src="${pass.qrImage && pass.qrImage.includes('data:') ? `cid:qr-${pass._id}` : pass.qrImage}" 
        alt="QR Code" 
        style="width: 250px; height: 250px; display: block; margin: 0 auto; border: 4px solid #ffffff;" 
        width="250" 
        height="250"
      />
    </div>
    <p style="margin: 15px 0 0 0; color: #EF4444; font-weight: bold; font-size: 13px;">⚠️ Present this QR code at the event entrance</p>
  </div>
` : `
  <div style="background: #FEF3C7; padding: 15px; border-radius: 10px; border-left: 4px solid #F59E0B; text-align: center;">
     <p style="margin: 0; color: #92400E; font-size: 14px;"><strong>⏳ Processing:</strong> Your QR code is being generated.</p>
  </div>
`}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Visitor Pass - ${place.name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">🎫 Your Visitor Pass</h1>
                  <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 16px;">PassHub Digital Pass System</p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 15px 0; color: #1F2937; font-size: 24px;">Hello ${guest.name}! 👋</h2>
                  <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                    Your visitor pass${passes.length > 1 ? 'es have' : ' has'} been generated successfully for <strong>${place.name}</strong>!
                  </p>
                </td>
              </tr>

              <!-- Event Details -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <h3 style="margin: 0 0 20px 0; font-size: 22px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 15px;">📍 Event Details</h3>
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="opacity: 0.9;">🏛️ Venue:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong>${place.name}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="opacity: 0.9;">📌 Location:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong>${place.location}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="opacity: 0.9;">📅 Date:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong>${formatDate(visitDate)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="opacity: 0.9;">👥 Total Passes:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong>${passes.length}</strong>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Passes with QR Codes -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <h3 style="margin: 0 0 20px 0; color: #1F2937; font-size: 20px; border-bottom: 3px solid #4F46E5; padding-bottom: 10px;">
                    Your Pass${passes.length > 1 ? 'es' : ''}
                  </h3>
                  ${passesHTML}
                </td>
              </tr>

              <!-- Important Instructions -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: #FEE2E2; border-left: 4px solid #DC2626; padding: 20px; border-radius: 10px;">
                    <h4 style="margin: 0 0 10px 0; color: #991B1B; font-size: 16px;">⚠️ Important Instructions</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
                      <li>Save this email - you'll need it at the entrance</li>
                      <li>Present the QR code to security personnel</li>
                      <li>Arrive 15 minutes before the event time</li>
                      <li>Bring a valid ID for verification</li>
                      <li>Do not share your QR code with others</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Refund Policy -->
              ${place.refundPolicy?.isRefundable ? `
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 10px;">
                    <h4 style="margin: 0 0 10px 0; color: #1E40AF; font-size: 16px;">💰 Refund Policy</h4>
                    <p style="margin: 0; color: #1E3A8A; font-size: 14px; line-height: 1.6;">
                      • Before visit day: ${place.refundPolicy.beforeVisitPercent}% refund<br>
                      • Same day cancellation: ${place.refundPolicy.sameDayPercent}% refund
                    </p>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- Support -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #4B5563; font-size: 14px;">
                      Need help? Contact us:
                    </p>
                    <p style="margin: 0;">
                      <a href="mailto:support@passhub.com" style="color: #4F46E5; text-decoration: none; font-weight: bold;">support@passhub.com</a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                    This is an automated email from PassHub
                  </p>
                  <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                    © ${new Date().getFullYear()} PassHub. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};