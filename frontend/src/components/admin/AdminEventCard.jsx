// // frontend/visitor-pass-frontend/src/components/admin/AdminEventCard.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Calendar, MapPin, Users, Settings, ToggleLeft, ToggleRight, XCircle, User, Eye } from 'lucide-react';  // Added Eye for Seats Status
// import ConfirmModal from '../common/ConfirmModal';
// import api from '../../utils/api';

// const AdminEventCard = ({ event, onEventUpdate, onSeatsStatus }) => {  // Added onSeatsStatus prop
//   const navigate = useNavigate();
//   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
//   const [cancelReason, setCancelReason] = useState('');
//   const [cancelling, setCancelling] = useState(false);

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     return new Date(dateStr).toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   const fillPercentage = event.capacity > 0 
//     ? Math.round((event.bookings / event.capacity) * 100) 
//     : 0;

//   const handleCancelEvent = async () => {
//     if (!cancelReason.trim()) {
//       alert('Please provide a reason for cancelling');
//       return;
//     }

//     setCancelling(true);
//     try {
//       const res = await api.post(`/admin/events/${event._id}/cancel`, {
//         reason: cancelReason
//       });

//       if (res.data.success) {
//         alert('Event cancelled successfully. All attendees have been notified.');
//         setShowCancelConfirm(false);
//         if (onEventUpdate) onEventUpdate();
//       }
//     } catch (error) {
//       alert('Error: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setCancelling(false);
//     }
//   };

//   return (
//     <>
//       <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100">
//         {/* Header */}
//         <div className="flex justify-between items-start mb-4">
//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
//             <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
//               <MapPin className="w-4 h-4" />
//               <span>{event.location}</span>
//             </div>
//             <div className="flex items-center gap-2 text-gray-600 text-sm">
//               <Calendar className="w-4 h-4" />
//               <span>{formatDate(event.eventDates?.start)} - {formatDate(event.eventDates?.end)}</span>
//             </div>
//           </div>
          
//         {/* Status + Booking Badge */}
//         <div className="flex flex-col items-end gap-2">
//           <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
//             event.status === 'CANCELLED'
//               ? 'bg-red-100 text-red-700'
//               : event.status === 'COMPLETED'
//                 ? 'bg-slate-100 text-slate-700'
//                 : 'bg-blue-100 text-blue-700'
//           }`}>
//             {event.status || 'UPCOMING'}
//           </div>
//           <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
//               event.isBookingEnabled 
//                 ? 'bg-green-100 text-green-700' 
//                 : 'bg-amber-100 text-amber-700'
//             }`}>
//               {event.isBookingEnabled ? 'Booking Open' : 'Booking Closed'}
//             </div>
//         </div>
//         </div>

//         {/* Host Info */}
//         <div className="bg-indigo-50 rounded-lg p-3 mb-4 border border-indigo-100">
//           <div className="flex items-center gap-2 mb-2">
//             <User className="w-4 h-4 text-indigo-600" />
//             <span className="text-sm font-semibold text-gray-700">Host Details</span>
//           </div>
//           <div className="text-sm text-gray-600">
//             <p><strong>Name:</strong> {event.host?.name}</p>
//             <p><strong>Email:</strong> {event.host?.email}</p>
//             {event.host?.subscription?.isActive && (
//               <p className="text-green-600 font-medium mt-1">
//                 ✓ Active Subscription ({event.host.subscription.daysRemaining || 0} days left)
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-3 gap-3 mb-4">
//           <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
//             <p className="text-2xl font-bold text-blue-600">{event.bookings}</p>
//             <p className="text-xs text-gray-600">Bookings</p>
//           </div>
//           <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
//             <p className="text-2xl font-bold text-purple-600">{event.capacity}</p>
//             <p className="text-xs text-gray-600">Capacity</p>
//           </div>
//           <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
//             <p className="text-2xl font-bold text-orange-600">{event.security || 0}</p>
//             <p className="text-xs text-gray-600">Security</p>
//           </div>
//         </div>

//         {/* Capacity Progress */}
//         <div className="mb-4">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm text-gray-600">Occupancy</span>
//             <span className="text-sm font-semibold text-gray-800">{fillPercentage}%</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//             <div 
//               className={`h-full rounded-full transition-all duration-500 ${
//                 fillPercentage >= 90 ? 'bg-red-500' :
//                 fillPercentage >= 70 ? 'bg-yellow-500' :
//                 'bg-green-500'
//               }`}
//               style={{ width: `${Math.min(fillPercentage, 100)}%` }}
//             />
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-2">
//           <button
//             onClick={() => navigate(`/admin/events/${event._id}/manage`)}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md"
//           >
//             <Settings className="w-4 h-4" />
//             Manage
//           </button>
//           {/* Added Seats Status Button */}
//           {onSeatsStatus && (
//             <button
//               onClick={() => onSeatsStatus(event)}
//               className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold border border-blue-200 flex items-center gap-2"
//             >
//               <Eye className="w-4 h-4" />
//               Seats Status
//             </button>
//           )}
//           {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
//             <button
//               onClick={() => setShowCancelConfirm(true)}
//               className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold border border-red-200 flex items-center gap-2"
//             >
//               <XCircle className="w-4 h-4" />
//               Cancel Event
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Cancel Confirmation Modal */}
//       {showCancelConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Event</h3>
//             <p className="text-gray-600 mb-4">
//               Are you sure you want to cancel <strong>{event.title}</strong>? 
//               This will refund all attendees 100% and notify them via email.
//             </p>
            
//             <textarea
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               placeholder="Enter reason for cancellation (required)..."
//               className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
//               rows="3"
//             />

//             <div className="flex gap-3">
//               <button
//                 onClick={() => {
//                   setShowCancelConfirm(false);
//                   setCancelReason('');
//                 }}
//                 className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCancelEvent}
//                 disabled={cancelling || !cancelReason.trim()}
//                 className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50"
//               >
//                 {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AdminEventCard;



// src/components/admin/AdminEventCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Settings, XCircle, 
  User, Eye, ShieldCheck, Zap, AlertTriangle 
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminEventCard = ({ event, onEventUpdate, onSeatsStatus }) => {
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const fillPercentage = event.capacity > 0 
    ? Math.round((event.bookings / event.capacity) * 100) 
    : 0;

  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      const res = await api.post(`/admin/events/${event._id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        setShowCancelConfirm(false);
        if (onEventUpdate) onEventUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="group bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden shadow-2xl">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-indigo-400 transition-colors">
                {event.title}
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  <MapPin size={12} className="text-indigo-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  <Calendar size={12} className="text-indigo-500" />
                  <span>{formatDate(event.eventDates?.start)} — {formatDate(event.eventDates?.end)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                event.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                event.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {event.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Host Context Unit */}
          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={14} className="text-cyan-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Host</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-bold text-slate-600 uppercase">Identity</p>
                <p className="text-xs font-bold text-slate-300 truncate">{event.host?.name}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-600 uppercase">Protocol</p>
                <p className="text-xs font-bold text-slate-300 truncate">{event.host?.email}</p>
              </div>
            </div>
          </div>

          {/* Metrics Matrix */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            {[
              { label: 'Bookings', val: event.bookings, color: 'text-indigo-400' },
              { label: 'Capacity', val: event.capacity, color: 'text-white' },
              { label: 'Security', val: event.security || 0, color: 'text-cyan-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                <p className={`${stat.color} text-xl font-black italic leading-none mb-1`}>{stat.val}</p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Architecture */}
          <div className="mb-8 px-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Occupancy Load</span>
              <span className={`text-[10px] font-black ${fillPercentage > 90 ? 'text-rose-500' : 'text-indigo-400'}`}>
                {fillPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${
                  fillPercentage >= 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                  fillPercentage >= 70 ? 'bg-amber-500' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                }`}
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Command Interface */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/events/${event._id}/manage`)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-slate-950 rounded-xl hover:bg-indigo-400 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/10"
              >
                <Settings size={14} /> Manage
              </button>
              {onSeatsStatus && (
                <button
                  onClick={() => onSeatsStatus(event)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
                >
                  <Eye size={14} /> Seats
                </button>
              )}
            </div>
            
            {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-3 bg-rose-500/5 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <XCircle size={14} /> Terminate Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Protocol Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Confirm Termination</h3>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Terminating <span className="text-white font-bold">{event.title}</span> will trigger immediate 100% refunds and system-wide notifications.
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for termination protocol..."
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-rose-500/50 outline-none transition-all mb-6 text-sm"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 transition-all font-black uppercase text-[10px] tracking-widest"
              >
                Abort
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {cancelling ? 'Executing...' : 'Terminate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEventCard;