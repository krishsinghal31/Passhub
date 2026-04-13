// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Calendar, MapPin, Users, IndianRupee, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

// const BookingCard = ({ booking }) => {
//   const navigate = useNavigate();

//   if (!booking) return null;

//   const placeName = booking.place?.name || 'Unknown Event';
//   const visitDate = booking.visitDate ? new Date(booking.visitDate).toLocaleDateString('en-US', { 
//     weekday: 'long',
//     year: 'numeric', 
//     month: 'long', 
//     day: 'numeric' 
//   }) : 'N/A';
//   const totalAmount = booking.totalAmount || 0;
//   const guestCount = booking.guestCount || booking.passes?.length || 0;

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'CONFIRMED':
//         return 'bg-green-100 text-green-700 border-green-200';
//       case 'CANCELLED':
//         return 'bg-red-100 text-red-700 border-red-200';
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-700 border-yellow-200';
//       case 'COMPLETED':
//         return 'bg-blue-100 text-blue-700 border-blue-200';
//       default:
//         return 'bg-gray-100 text-gray-700 border-gray-200';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'CONFIRMED':
//         return <CheckCircle className="text-green-600" size={18} />;
//       case 'CANCELLED':
//         return <XCircle className="text-red-600" size={18} />;
//       default:
//         return <Clock className="text-yellow-600" size={18} />;
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex-1">
//           <h3 className="font-black text-xl text-gray-900 mb-2">{placeName}</h3>
//           {booking.place?.location && (
//             <div className="flex items-center text-gray-600 mb-2">
//               <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
//               <span className="text-sm">{booking.place.location}</span>
//             </div>
//           )}
//         </div>
//         <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${getStatusColor(booking.status)}`}>
//           {getStatusIcon(booking.status)}
//           <span className="font-bold text-xs uppercase tracking-widest">{booking.status}</span>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div className="flex items-center text-gray-600">
//           <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase">Visit Date</p>
//             <p className="text-sm font-bold">{visitDate}</p>
//           </div>
//         </div>
//         <div className="flex items-center text-gray-600">
//           <Users className="w-5 h-5 mr-2 text-orange-500" />
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase">Guests</p>
//             <p className="text-sm font-bold">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-4 border border-indigo-100">
//         <div className="flex items-center gap-2">
//           <IndianRupee className="text-indigo-600" size={20} />
//           <span className="text-xs font-semibold text-gray-600 uppercase">Total Amount</span>
//         </div>
//         <span className="text-2xl font-black text-indigo-600">
//           ₹{totalAmount} {totalAmount === 0 && <span className="text-green-600 text-sm">(Free)</span>}
//         </span>
//       </div>

//       {booking.passes && booking.passes.length > 0 && (
//         <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-gray-200">
//           <p className="text-xs font-bold text-gray-500 uppercase mb-2">Passes</p>
//           <div className="flex flex-wrap gap-2">
//             {booking.passes.map((pass, idx) => (
//               <div 
//                 key={idx} 
//                 className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
//                   pass.status === 'APPROVED' 
//                     ? 'bg-green-100 text-green-700' 
//                     : 'bg-gray-100 text-gray-600'
//                 }`}
//               >
//                 {pass.guest?.name || `Guest ${idx + 1}`} - {pass.status}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <button
//         onClick={() => navigate(`/booking/${booking._id}`)}
//         className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
//       >
//         View Details <ArrowRight size={18} />
//       </button>
//     </div>
//   );
// };

// export default BookingCard;




// src/components/visitor/BookingCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Zap,
  Ticket
} from 'lucide-react';

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const placeName = booking.place?.name || 'Null Protocol';
  const visitDate = booking.visitDate ? new Date(booking.visitDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }) : 'N/A';
  
  const totalAmount = booking.totalAmount || 0;
  const guestCount = booking.guestCount || booking.passes?.length || 0;
  const paymentStatus = booking.paymentStatus || (totalAmount === 0 ? 'FREE' : 'PENDING');

  const statusConfig = {
    CONFIRMED: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: <CheckCircle2 size={14}/> },
    PENDING: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={14}/> },
    CANCELLED: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <AlertCircle size={14}/> },
    COMPLETED: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Zap size={14}/> },
    EXPIRED: { color: 'text-slate-500', bg: 'bg-slate-800/50', border: 'border-slate-700', icon: <Zap size={14}/> }
  };

  const theme = statusConfig[booking.status] || statusConfig.PENDING;

  return (
    <div 
      onClick={() => navigate(`/booking/${booking._id}`)}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-1 border border-slate-800 hover:border-cyan-500/30 transition-all duration-500 cursor-pointer hover:translate-y-[-8px] shadow-2xl"
    >
      {/* Top Header Section */}
      <div className="bg-slate-800/30 rounded-t-[2.3rem] p-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${theme.bg} ${theme.color} ${theme.border} text-[9px] font-black uppercase tracking-[0.2em]`}>
            {theme.icon}
            {booking.status}
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-700 text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </div>
        
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {placeName}
        </h3>
      </div>

      {/* Info Specs Grid */}
      <div className="p-6 pt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-1 text-cyan-500">
              <Calendar size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Timestamp</span>
            </div>
            <p className="text-sm font-bold text-slate-200">{visitDate}</p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-1 text-blue-500">
              <Users size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Units</span>
            </div>
            <p className="text-sm font-bold text-slate-200">{guestCount} Slots</p>
          </div>
        </div>

        {/* Deployment Location */}
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-cyan-400 transition-colors">
            <MapPin size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Deployment Zone</p>
            <p className="text-sm font-bold text-slate-300 truncate tracking-tight">
              {booking.place?.location || 'Coordinate Pending'}
            </p>
          </div>
        </div>

        {/* Mini Pass Ledger */}
        {booking.passes && booking.passes.length > 0 && (
          <div className="px-2">
            <div className="flex items-center gap-2 mb-3">
              <Ticket size={12} className="text-slate-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pass Matrix</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {booking.passes.slice(0, 3).map((pass, idx) => (
                <div key={idx} className="px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-[10px] font-bold text-slate-400">
                  {pass.status === 'APPROVED' && <span className="text-cyan-400 mr-1">●</span>}
                  {pass.guest?.name?.split(' ')[0] || `G-${idx + 1}`}
                </div>
              ))}
              {booking.passes.length > 3 && (
                <div className="px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-[10px] font-bold text-slate-500">
                  +{booking.passes.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Ledger */}
      <div className="mx-4 mb-4 px-5 py-4 bg-slate-950/80 rounded-[1.8rem] border border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            {paymentStatus === 'PAID' || paymentStatus === 'FREE' ? 'Payment' : 'Payment Pending'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-white tracking-tighter">
            ₹{totalAmount}
          </span>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
            paymentStatus === 'PAID' ? 'bg-emerald-500 text-white' :
            paymentStatus === 'FREE' ? 'bg-cyan-500 text-slate-950' :
            paymentStatus === 'FAILED' ? 'bg-rose-500 text-white' :
            'bg-amber-500 text-slate-950'
          }`}>
            {paymentStatus}
          </span>
        </div>
      </div>

      {/* Holographic Border Overlay */}
      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent group-hover:border-cyan-500/10 pointer-events-none transition-all duration-500"></div>
    </div>
  );
};

export default BookingCard;