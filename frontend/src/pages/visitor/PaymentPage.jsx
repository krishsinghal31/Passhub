import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { buildPassFilename, downloadDataUrl, generatePassImageDataUrl } from '../../utils/passImage';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { amount, eventName, passBackground, eventImage } = location.state || { amount: 0, eventName: 'Event' };
    const [processing, setProcessing] = useState(false);
    const [gateway, setGateway] = useState('RAZORPAY');
    const [postPayment, setPostPayment] = useState(null);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // In a real app, this integrates with Razorpay/Stripe
            const res = await api.post('/passes/payments/confirm', { 
                bookingId,
                transactionId: `${gateway}_TXN_${Date.now()}` 
            });
            
            if (res.data.success) {
                toast.success("Payment successful. Generating email passes...");
                const passImages = [];
                for (const pass of res.data.passes || []) {
                  if (!pass?.qrImage) continue;
                  try {
                    const cardImage = await generatePassImageDataUrl({
                      eventName,
                      guestName: pass.guest,
                      visitDate: new Date(),
                      qrImage: pass.qrImage,
                      passBackground,
                      eventImage
                    });
                    passImages.push({ passId: pass.passId, cardImage });
                  } catch (e) {
                    console.error("Error generating pass card image for payment email:", e);
                  }
                }

                try {
                  await api.post('/passes/send-email', {
                    bookingId,
                    passImages
                  });
                  toast.success('Passes emailed successfully!');
                } catch (emailErr) {
                  console.error("Failed to trigger pass email dispatch:", emailErr);
                }

                setPostPayment({
                  bookingId,
                  passes: res.data.passes || []
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Payment confirmation failed.");
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadAllPasses = async () => {
      if (!postPayment?.passes?.length) {
        navigate('/dashboard');
        return;
      }
      for (const pass of postPayment.passes) {
        if (!pass?.qrImage) continue;
        try {
          const dataUrl = await generatePassImageDataUrl({
            eventName,
            guestName: pass.guest,
            visitDate: new Date(),
            qrImage: pass.qrImage,
            passBackground,
            eventImage
          });
          const filename = buildPassFilename({
            eventName,
            guestName: pass.guest,
            visitDate: new Date()
          });
          downloadDataUrl(dataUrl, filename);
        } catch (_) {}
      }
      navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <CreditCard size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Secure Checkout</h2>
                    <p className="text-gray-500">Completing booking for {eventName}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold text-xl">₹{amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck size={14} /> Encrypted Transaction
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button
                    type="button"
                    onClick={() => setGateway('RAZORPAY')}
                    className={`p-3 rounded-xl border font-bold text-sm ${gateway === 'RAZORPAY' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    <CreditCard className="inline mr-2" size={16} /> Razorpay
                  </button>
                  <button
                    type="button"
                    onClick={() => setGateway('STRIPE')}
                    className={`p-3 rounded-xl border font-bold text-sm ${gateway === 'STRIPE' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    <Landmark className="inline mr-2" size={16} /> Stripe
                  </button>
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    {processing ? 'Processing...' : `Pay ₹${amount}`}
                </button>
            </div>
            {postPayment && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-black mb-2">Payment Confirmed</h3>
                  <p className="text-slate-400 text-sm mb-6">Download all pass images now?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleDownloadAllPasses} className="py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest">
                      Download All
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="py-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-black text-xs uppercase tracking-widest">
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default PaymentPage;