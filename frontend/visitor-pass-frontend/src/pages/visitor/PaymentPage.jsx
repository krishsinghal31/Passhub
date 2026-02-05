import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { amount, eventName } = location.state || { amount: 0, eventName: 'Event' };
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // In a real app, this integrates with Razorpay/Stripe
            const res = await api.post('/passes/payments/confirm', { 
                bookingId,
                transactionId: `TXN_${Date.now()}` 
            });
            
            if (res.data.success) {
                alert("Payment Successful! Your QR passes have been emailed.");
                navigate('/dashboard');
            }
        } catch (err) {
            alert("Payment confirmation failed.");
        } finally {
            setProcessing(false);
        }
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

                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    {processing ? 'Processing...' : `Pay ₹${amount}`}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;