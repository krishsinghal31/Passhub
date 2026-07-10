// frontend/visitor-pass-frontend/src/components/security/QRScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner'; 

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [result, setResult] = useState('');
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setResult(result.data);
          onScan(result.data);
        },
        {
          onDecodeError: (err) => console.error('QR decode error:', err),
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      setScanner(qrScanner);
      qrScanner.start();

      return () => {
        qrScanner.destroy();
      };
    }
  }, [onScan]);

  return (
    <div className="p-4">
      <video ref={videoRef} style={{ width: '100%', height: '300px' }} />
      <p>Scanned: {result}</p>
    </div>
  );
};

export default QRScanner;