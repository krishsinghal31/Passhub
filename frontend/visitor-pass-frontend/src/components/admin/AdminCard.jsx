// // src/components/admin/AdminCard.jsx
// import React, { useState } from 'react';
// import { UserCog, Mail, Calendar, ShieldOff, CheckCircle, XCircle } from 'lucide-react';
// import ConfirmModal from '../common/ConfirmModal';

// const AdminCard = ({ admin, onDisable }) => {
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [disabling, setDisabling] = useState(false);
//   const [reason, setReason] = useState('');

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     return new Date(dateStr).toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   const handleDisable = async () => {
//     if (!reason.trim()) {
//       alert('Please provide a reason for disabling this admin');
//       return;
//     }
    
//     setDisabling(true);
//     try {
//       await onDisable(admin._id, reason);
//       setShowConfirm(false);
//     } catch (error) {
//       console.error('Failed to disable admin:', error);
//     } finally {
//       setDisabling(false);
//     }
//   };

//   return (
//     <>
//       <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
//         <div className="flex justify-between items-start mb-4">
//           <div className="flex items-center gap-3 flex-1">
//             <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
//               admin.isActive 
//                 ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
//                 : 'bg-gray-400'
//             }`}>
//               <UserCog className="w-7 h-7 text-white" />
//             </div>
//             <div className="flex-1">
//               <h4 className="font-bold text-lg text-gray-800 mb-1">{admin.name}</h4>
//               <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
//                 <Mail className="w-4 h-4" />
//                 <span>{admin.email}</span>
//               </div>
//               <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
//                 {admin.role}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-3 mb-4">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-gray-600">Joined</span>
//             <span className="font-medium text-gray-800">
//               {formatDate(admin.createdAt)}
//             </span>
//           </div>

//           <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//             <span className="text-sm font-medium text-gray-600">Status</span>
//             {admin.isActive ? (
//               <span className="flex items-center gap-1 text-green-600 font-semibold">
//                 <CheckCircle className="w-5 h-5" />
//                 Active
//               </span>
//             ) : (
//               <span className="flex items-center gap-1 text-red-600 font-semibold">
//                 <XCircle className="w-5 h-5" />
//                 Disabled
//               </span>
//             )}
//           </div>

//           {admin.disabledAt && (
//             <div className="bg-red-50 rounded-lg p-3 text-sm">
//               <p className="text-red-700 font-semibold mb-1">Disabled on {formatDate(admin.disabledAt)}</p>
//               {admin.disabledReason && (
//                 <p className="text-red-600">{admin.disabledReason}</p>
//               )}
//             </div>
//           )}
//         </div>

//         {admin.isActive && (
//           <button
//             onClick={() => setShowConfirm(true)}
//             className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
//           >
//             <ShieldOff className="w-5 h-5" />
//             Disable Admin
//           </button>
//         )}
//       </div>

//       {showConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">Disable Admin</h3>
//             <p className="text-gray-600 mb-4">
//               Are you sure you want to disable <strong>{admin.name}</strong>? 
//               Please provide a reason:
//             </p>
            
//             <textarea
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Enter reason for disabling..."
//               className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
//               rows="3"
//             />

//             <div className="flex gap-3">
//               <button
//                 onClick={() => {
//                   setShowConfirm(false);
//                   setReason('');
//                 }}
//                 className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDisable}
//                 disabled={disabling || !reason.trim()}
//                 className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50"
//               >
//                 {disabling ? 'Disabling...' : 'Disable'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AdminCard;




// src/components/admin/AdminCard.jsx
import React, { useState } from 'react';
import { UserCog, Mail, Calendar, ShieldOff, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const AdminCard = ({ admin, onDisable }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [reason, setReason] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const handleDisable = async () => {
    if (!reason.trim()) return;
    setDisabling(true);
    try {
      await onDisable(admin._id, reason);
      setShowConfirm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <div className="group bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-1 border border-slate-800 hover:border-indigo-500/30 transition-all duration-500">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                admin.isActive 
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                <UserCog className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-black text-white uppercase italic tracking-tighter text-lg leading-none mb-1">
                  {admin.name}
                </h4>
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-indigo-500" />
                  {admin.role}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-slate-400">
              <Mail size={14} className="text-indigo-500" />
              <span className="text-xs font-bold truncate">{admin.email}</span>
            </div>

            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</span>
              {admin.isActive ? (
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-black uppercase">
                  <CheckCircle2 size={12} /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-rose-500 font-black uppercase">
                  <XCircle size={12} /> Restricted
                </span>
              )}
            </div>

            {!admin.isActive && admin.disabledReason && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-3">
                <p className="text-[9px] font-black text-rose-500 uppercase mb-1">Restriction Reason</p>
                <p className="text-[11px] text-slate-400 font-medium italic">"{admin.disabledReason}"</p>
              </div>
            )}
          </div>

          {admin.isActive && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 border border-slate-700 hover:border-rose-500/30 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              <ShieldOff size={14} /> Deactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Modern Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Deactivate Admin</h3>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You are about to restrict access for <span className="text-white font-bold">{admin.name}</span>. 
              Please state the reason for this action:
            </p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter compliance or security reason..."
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-rose-500/50 outline-none transition-all mb-6 text-sm"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 transition-all font-black uppercase text-[10px] tracking-widest"
              >
                Abort
              </button>
              <button
                onClick={handleDisable}
                disabled={disabling || !reason.trim()}
                className="flex-1 px-4 py-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {disabling ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCard;