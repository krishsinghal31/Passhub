// // src/components/visitor/CancelPassModal.jsx
// import React, { useState } from 'react';
// import { X, AlertTriangle, Calendar } from 'lucide-react';

// const CancelPassModal = ({ isOpen, pass, onCancel, onClose }) => {
//   const [reason, setReason] = useState('');
//   const [loading, setLoading] = useState(false);

//   if (!isOpen || !pass) return null;

//   const calculateRefund = () => {
//     if (!pass.visitDate || !pass.price) return { percentage: 0, amount: 0 };
    
//     const visitDate = new Date(pass.visitDate);
//     const today = new Date();
//     const daysUntilEvent = Math.ceil((visitDate - today) / (1000 * 60 * 60 * 24));
    
//     let refundPercentage = 0;
//     if (daysUntilEvent >= 7) {
//       refundPercentage = 100;
//     } else if (daysUntilEvent >= 3) {
//       refundPercentage = 50;
//     } else if (daysUntilEvent >= 1) {
//       refundPercentage = 25;
//     }
    
//     return {
//       percentage: refundPercentage,
//       amount: (pass.price * refundPercentage) / 100
//     };
//   };

//   const refund = calculateRefund();

//   const handleSubmit = async () => {
//     if (!reason.trim()) {
//       alert('Please provide a cancellation reason');
//       return;
//     }

//     setLoading(true);
//     try {
//       await onCancel(pass._id, reason);
//     } catch (error) {
//       console.error('Failed to cancel:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div 
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800">Cancel Pass</h3>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//             <X className="w-6 h-6 text-gray-600" />
//           </button>
//         </div>

//         {/* Pass Details */}
//         <div className="mb-6 p-4 bg-gray-50 rounded-xl">
//           <h4 className="font-bold text-gray-800 mb-2">{pass.place?.name || 'Event'}</h4>
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <Calendar className="w-4 h-4" />
//             <span>{new Date(pass.visitDate).toLocaleDateString()}</span>
//           </div>
//         </div>

//         {/* Refund Information */}
//         <div className={`mb-6 p-4 rounded-xl border-2 ${
//           refund.percentage === 100 ? 'bg-green-50 border-green-300' :
//           refund.percentage >= 50 ? 'bg-yellow-50 border-yellow-300' :
//           refund.percentage > 0 ? 'bg-orange-50 border-orange-300' :
//           'bg-red-50 border-red-300'
//         }`}>
//           <h4 className="font-bold text-gray-800 mb-2">Refund Information</h4>
//           <p className="text-sm text-gray-700 mb-2">
//             You will receive a <strong>{refund.percentage}% refund</strong> for this cancellation.
//           </p>
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Original Price:</span>
//             <span className="font-bold text-gray-800">₹{pass.price}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Refund Amount:</span>
//             <span className="font-bold text-green-600">₹{refund.amount.toFixed(2)}</span>
//           </div>
//         </div>

//         {/* Refund Policy Notice */}
//         <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <p className="text-xs text-blue-800">
//             <strong>Refund Policy:</strong><br />
//             • 7+ days before: 100% refund<br />
//             • 3-6 days before: 50% refund<br />
//             • 1-2 days before: 25% refund<br />
//             • Same day: No refund
//           </p>
//         </div>

//         {/* Cancellation Reason */}
//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             Reason for Cancellation *
//           </label>
//           <textarea
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             placeholder="Please tell us why you're cancelling..."
//             className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
//             rows="3"
//             required
//           />
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
//           >
//             Keep Pass
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading || !reason.trim()}
//             className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg disabled:opacity-50"
//           >
//             {loading ? 'Cancelling...' : 'Cancel Pass'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CancelPassModal;

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Calculator } from 'lucide-react';

const CancelPassModal = ({ pass, onCancel, onConfirm }) => {
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundPercentage, setRefundPercentage] = useState(0);

  useEffect(() => {
    calculateRefund();
  }, [pass]);

  const calculateRefund = () => {
    if (!pass || !pass.visitDate) return;

    const visitDate = new Date(pass.visitDate);
    const today = new Date();
    const daysDiff = Math.ceil((visitDate - today) / (1000 * 60 * 60 * 24));

    let percentage = 0;
    if (daysDiff >= 7) percentage = 100;
    else if (daysDiff >= 3) percentage = 50;
    else if (daysDiff >= 1) percentage = 25;
    else percentage = 0;

    const amount = (pass.amountPaid || 0) * (percentage / 100);
    setRefundAmount(amount);
    setRefundPercentage(percentage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Cancel Pass</h3>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel the pass for <strong>{pass?.guest?.name}</strong>?
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">Refund Calculation</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Original Amount:</span>
                <span>₹{pass?.amountPaid || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Refund Percentage:</span>
                <span className="font-semibold text-green-600">{refundPercentage}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Refund Amount:</span>
                <span className="font-bold text-green-600">₹{refundAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">⚠️ Important:</p>
            <p>Cancellation is irreversible. The refund will be processed within 5-7 business days.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Keep Pass
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg"
          >
            Cancel Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelPassModal;