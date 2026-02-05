// backend/src/services/qr.js
const QRCode = require("qrcode");

exports.generateQR = async (payload) => {
  try {
    const qrData = `${payload.passId}|${payload.qrToken}`;
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1
    });
    
    return qrImage; 
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};

exports.parseQR = (qrData) => {
  try {
    const [passId, qrToken] = qrData.split('|');
    
    if (!passId || !qrToken) {
      throw new Error('Invalid QR format');
    }
    
    return { passId, qrToken };
    
  } catch (error) {
    console.error("❌ QR parsing error:", error);
    throw new Error("Invalid QR code format");
  }
};

exports.isValidQRFormat = (qrData) => {
  if (!qrData || typeof qrData !== 'string') {
    return false;
  }
  
  const parts = qrData.split('|');
  
  if (parts.length !== 2) {
    return false;
  }
  
  const [passId, token] = parts;
  
  if (!passId || passId.length !== 24) {
    return false;
  }
  
  if (!token || token.length !== 36) {
    return false;
  }
  
  return true;
};
