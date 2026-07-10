// src/components/common/SuccessModal.jsx
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const SuccessModal = ({ isOpen, title, message, onClose, confirmText = "Continue" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                    {confirmText} <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;

// import React from 'react';
// import { AlertTriangle, X } from 'lucide-react';

// const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
//   if (!isOpen) return null;

//   const typeStyles = {
//     danger: 'from-red-600 to-pink-600',
//     warning: 'from-yellow-600 to-orange-600',
//     success: 'from-green-600 to-emerald-600',
//     info: 'from-blue-600 to-indigo-600'
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
//         <div className="flex items-start gap-4 mb-6">
//           <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${typeStyles[type]} flex items-center justify-center flex-shrink-0`}>
//             <AlertTriangle className="w-6 h-6 text-white" />
//           </div>
//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
//             <p className="text-gray-600">{message}</p>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={onCancel}
//             className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
//           >
//             {cancelText}
//           </button>
//           <button
//             onClick={onConfirm}
//             className={`flex-1 px-4 py-3 bg-gradient-to-r ${typeStyles[type]} text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg`}
//           >
//             {confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConfirmModal;