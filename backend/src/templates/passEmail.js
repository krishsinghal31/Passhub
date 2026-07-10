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

  const passesHTML = passes.map((pass, index) => {
    if (pass.cardCid) {
      return `
        <div style="text-align: center; margin: 25px 0;">
          <img 
            src="${pass.cardCid}" 
            alt="Visitor Pass Card" 
            style="width: 100%; max-width: 500px; height: auto; border-radius: 16px; display: block; margin: 0 auto; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" 
          />
        </div>
      `;
    }

    const bgStyle = (place.passBackground || place.image)
      ? `background-image: url('${place.passBackground || place.image}'); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0e7490 100%);`;

    return `
      <div style="width: 500px; height: 280px; position: relative; border-radius: 16px; margin: 25px auto; overflow: hidden; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.2); ${bgStyle}">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.45); z-index: 1;"></div>
        
        <div style="position: absolute; top: 20px; left: 25px; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.6); z-index: 2; max-width: 250px; line-height: 1.2;">
          ${place.name}
        </div>

        <div style="position: absolute; top: 22px; right: 25px; display: flex; align-items: center; z-index: 2;">
          <span style="color: #ff6b00; font-weight: 900; font-size: 20px; font-style: italic; margin-right: 4px;">V</span>
          <span style="color: #ffffff; font-weight: bold; font-size: 13px; letter-spacing: 1px;">VISITPASS</span>
        </div>

        <div style="position: absolute; bottom: 20px; left: 25px; right: 220px; background: rgba(0, 0, 0, 0.55); border-top: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 12px 15px; z-index: 2;">
          <div style="font-size: 12px; color: #9ca3af; margin-bottom: 2px;">Guest: <span style="font-weight: bold; color: #ffffff; font-size: 14px;">${pass.guest?.name || pass.guest || 'Guest'}</span></div>
          <div style="font-size: 12px; color: #9ca3af;">Date: <span style="font-weight: bold; color: #ffffff; font-size: 14px;">${formatDate(pass.visitDate)}</span></div>
        </div>

        <div style="position: absolute; bottom: 20px; right: 25px; top: 70px; width: 170px; background: rgba(0, 0, 0, 0.45); border: 2px solid #22d3ee; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; z-index: 2;">
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: white; padding: 8px;">
            <img src="${pass.qrImage && pass.qrImage.includes('data:') ? `cid:qr-${pass._id}` : pass.qrImage}" alt="QR Code" style="width: 100%; height: auto; display: block;" />
          </div>
          <div style="background: #0f172a; color: #22d3ee; text-align: center; font-size: 10px; font-weight: bold; padding: 6px 0; letter-spacing: 0.5px; border-top: 1px solid #22d3ee;">
            SCAN TO ENTER
          </div>
        </div>
      </div>
    `;
  }).join('');

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
                          ${place.ticketAccessMode === 'ALL_DAYS' && place.eventDates?.start && place.eventDates?.end
                            ? `<strong>${formatDate(place.eventDates.start)} - ${formatDate(place.eventDates.end)}</strong>`
                            : `<strong>${formatDate(visitDate)}</strong>`
                          }
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