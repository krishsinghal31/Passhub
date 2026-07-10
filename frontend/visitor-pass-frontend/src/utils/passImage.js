const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (src && src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const buildPassFilename = ({ eventName, guestName, visitDate }) => {
  const clean = (v) => (v || 'pass').replace(/[^a-zA-Z0-9_-]/g, '_');
  const datePart = visitDate ? new Date(visitDate).toISOString().slice(0, 10) : 'date';
  return `${clean(eventName)}_${clean(guestName)}_${datePart}.png`;
};

export const generatePassImageDataUrl = async ({
  eventName,
  guestName,
  visitDate,
  qrImage,
  passBackground,
  eventImage
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  // 1. Draw Background Image or Gradient Fallback
  const bgUrl = passBackground || eventImage;
  let bgLoaded = false;
  
  if (bgUrl) {
    try {
      const bgImg = await loadImage(bgUrl);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      bgLoaded = true;
    } catch (e) {
      console.warn("Failed to load pass background image, using gradient fallback", e);
    }
  }

  if (!bgLoaded) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.55, '#1e1b4b');
    gradient.addColorStop(1, '#0e7490');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Add dark overlay to ensure high text contrast
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const drawRoundedRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 2. Draw Top-Right VISITPASS Logo
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(850, 60);
  ctx.lineTo(870, 95);
  ctx.lineTo(900, 50);
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#f97316'; // orange-500
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('VISITPASS', 920, 85);
  ctx.restore();

  // 3. Draw Top-Left Event Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText(eventName || 'PASSHUB EVENT', 80, 160);

  // 4. Draw Bottom-Left Glass Panel
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  drawRoundedRect(60, 440, 560, 200, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Draw guest details inside the glass panel
  ctx.fillStyle = '#ffffff';
  ctx.font = '36px sans-serif';
  ctx.fillText('Guest: ', 95, 515);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px sans-serif';
  const guestLabelW = ctx.measureText('Guest: ').width;
  ctx.fillText(guestName || 'Guest', 95 + guestLabelW, 515);

  ctx.fillStyle = '#ffffff';
  ctx.font = '36px sans-serif';
  ctx.fillText('Date: ', 95, 595);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px sans-serif';
  const dateLabelW = ctx.measureText('Date: ').width;
  const dateVal = visitDate
    ? new Date(visitDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date TBA';
  ctx.fillText(dateVal, 95 + dateLabelW, 595);

  // 5. Draw Right QR Code card
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  drawRoundedRect(680, 120, 460, 520, 16);
  ctx.stroke();
  ctx.restore();

  // QR Code white container
  ctx.save();
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(695, 135, 430, 410, 8);
  ctx.fill();
  ctx.restore();

  // Draw QR image
  if (qrImage) {
    try {
      const qr = await loadImage(qrImage);
      ctx.drawImage(qr, 735, 175, 350, 350);
    } catch (e) {
      console.error("Failed to load QR image in canvas", e);
    }
  }

  // Draw SCAN TO ENTER bottom bar
  ctx.save();
  ctx.fillStyle = '#0f172a';
  const barX = 695;
  const barY = 555;
  const barW = 430;
  const barH = 70;
  const barR = 8;
  
  ctx.beginPath();
  ctx.moveTo(barX, barY);
  ctx.lineTo(barX + barW, barY);
  ctx.lineTo(barX + barW, barY + barH - barR);
  ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - barR, barY + barH);
  ctx.lineTo(barX + barR, barY + barH);
  ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - barR);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN TO ENTER', barX + barW / 2, barY + 45);
  ctx.restore();

  return canvas.toDataURL('image/png');
};

export const downloadDataUrl = (dataUrl, filename) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
