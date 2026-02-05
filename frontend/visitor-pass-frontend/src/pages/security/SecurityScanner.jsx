import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, ShieldCheck, AlertCircle, RefreshCw, User, Mail, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const SecurityScanner = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    const config = { 
      fps: 20, 
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0 
    };

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          () => {} // onScanFailure - ignore errors during scanning
        );
      } catch (err) {
        console.error("Scanner failed to start", err);
        setError("Camera access denied. Please allow camera permissions.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    try {
      // Stop the camera feed once a code is found
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }
      setIsScanning(false);

      // ✅ FIX: Ensure QR code is in correct format (passId|qrToken)
      // The QR code should already be in this format from backend
      // But we'll validate and clean it
      let qrCode = decodedText.trim();
      
      // If QR contains data URL or other metadata, extract just the data
      if (qrCode.includes('|')) {
        // Already in correct format
      } else {
        // Try to parse if it's a JSON or other format
        try {
          const parsed = JSON.parse(qrCode);
          if (parsed.passId && parsed.qrToken) {
            qrCode = `${parsed.passId}|${parsed.qrToken}`;
          }
        } catch (e) {
          // Not JSON, use as is
        }
      }

      const res = await api.post('/security/scan-pass', {
        qrCode: qrCode,
        placeId: placeId
      });

      if (res.data.success) {
        setScanResult(res.data);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or tampered QR code");
      setScanResult(null);
    }
  };

  const resetScanner = async () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
    
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          { fps: 20, qrbox: { width: 280, height: 280 } },
          onScanSuccess,
          () => {}
        );
      } catch (err) {
        console.error("Failed to restart scanner", err);
        setError("Failed to restart camera");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col items-center p-6">
      <div className="w-full max-w-md">
        
        <button 
          onClick={() => navigate(-1)} 
          className="text-white/70 mb-8 flex items-center gap-2 font-bold text-sm hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Exit Security Portal
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          
          {isScanning ? (
            <div className="p-6">
              <div id="reader" className="rounded-2xl overflow-hidden border-4 border-indigo-200"></div>
              <div className="py-6 text-center">
                <p className="text-slate-600 text-sm font-bold uppercase tracking-widest animate-pulse">
                  Scanning for QR codes...
                </p>
                <p className="text-slate-400 text-xs mt-2">Point camera at visitor's QR code</p>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center animate-in zoom-in-95 duration-300">
              {scanResult ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 border-4 border-green-200 shadow-lg">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Verified</h2>
                  <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-8">Entry Approved</p>
                  
                  <div className="w-full space-y-3 mb-10 text-left bg-slate-50 p-6 rounded-2xl">
                    <DataRow icon={<User size={16}/>} label="Visitor" value={scanResult.visitor?.name || 'N/A'} />
                    {scanResult.visitor?.email && (
                      <DataRow icon={<Mail size={16}/>} label="Email" value={scanResult.visitor.email} />
                    )}
                    <DataRow icon={<Clock size={16}/>} label="Check-in Time" value={new Date(scanResult.visitor?.checkInTime || Date.now()).toLocaleTimeString()} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 border-4 border-red-200 shadow-lg">
                    <AlertCircle size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Rejected</h2>
                  <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-6">Invalid Pass</p>
                  
                  <div className="bg-red-50 p-4 rounded-2xl w-full mb-10 border border-red-100">
                    <p className="text-red-700 text-sm font-semibold text-center leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={resetScanner}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl transform hover:scale-105 active:scale-95"
              >
                <RefreshCw size={18} /> Scan Next Pass
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 text-center opacity-50">
          <p className="text-white text-xs font-bold uppercase tracking-widest">Authorized Personnel Only</p>
          <p className="text-white text-[10px] font-medium mt-2 tracking-widest">Portal ID: {placeId?.substring(0, 8)}</p>
        </div>
      </div>
    </div>
  );
};

const DataRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-700">{value}</span>
  </div>
);

export default SecurityScanner;
