// // src/components/visitor/BookingDetailCard.jsx
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Calendar, 
//   MapPin, 
//   Users, 
//   ArrowRight, 
//   CheckCircle2, 
//   Clock, 
//   AlertCircle,
//   CreditCard
// } from 'lucide-react';

// const BookingDetailCard = ({ booking }) => {
//   const navigate = useNavigate();

//   if (!booking) return null;

//   const visitDate = new Date(booking.visitDate);
//   const isPast = visitDate < new Date().setHours(0, 0, 0, 0);
  
//   // Calculate attendance progress
//   const totalPasses = booking.passes?.length || 0;
//   const checkedInCount = booking.passes?.filter(p => p.checkInTime).length || 0;
//   const checkInPercentage = totalPasses > 0 ? (checkedInCount / totalPasses) * 100 : 0;

//   const statusConfig = {
//     CONFIRMED: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <CheckCircle2 size={16}/> },
//     PENDING: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Clock size={16}/> },
//     CANCELLED: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertCircle size={16}/> },
//     EXPIRED: { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', icon: <Clock size={16}/> }
//   };

//   const status = isPast && booking.status === 'CONFIRMED' ? 'EXPIRED' : booking.status;
//   const theme = statusConfig[status] || statusConfig.PENDING;

//   return (
//     <div 
//       onClick={() => navigate(`/booking/${booking._id}`)}
//       className="group relative bg-white rounded-[2rem] p-1 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100 hover:-translate-y-1"
//     >
//       {/* Top Section with Status */}
//       <div className="bg-slate-50/50 rounded-t-[1.8rem] p-6 pb-4">
//         <div className="flex justify-between items-start mb-4">
//           <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${theme.bg} ${theme.color} ${theme.border} text-[10px] font-black uppercase tracking-widest`}>
//             {theme.icon}
//             {status}
//           </div>
//           <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
//             <ArrowRight size={20} />
//           </div>
//         </div>
        
//         <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
//           {booking.place?.name || 'Event Booking'}
//         </h3>
//       </div>

//       {/* Middle Section with Icons */}
//       <div className="p-6 pt-2 space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex items-center gap-3 text-slate-600">
//             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
//               <Calendar size={18} />
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
//               <p className="text-sm font-bold text-slate-700">
//                 {visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3 text-slate-600">
//             <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
//               <Users size={18} />
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-400 uppercase">Guests</p>
//               <p className="text-sm font-bold text-slate-700">{totalPasses} Persons</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 text-slate-600">
//           <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
//             <MapPin size={18} />
//           </div>
//           <div className="overflow-hidden">
//             <p className="text-[10px] font-bold text-slate-400 uppercase">Venue</p>
//             <p className="text-sm font-bold text-slate-700 truncate">{booking.place?.location || 'Location Pending'}</p>
//           </div>
//         </div>

//         {/* Progress Bar for Attendance (Only if Confirmed) */}
//         {status === 'CONFIRMED' && totalPasses > 0 && (
//           <div className="pt-2">
//             <div className="flex justify-between mb-1.5">
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check-in Progress</span>
//               <span className="text-[10px] font-bold text-indigo-600">{checkedInCount}/{totalPasses}</span>
//             </div>
//             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
//               <div 
//                 className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
//                 style={{ width: `${checkInPercentage}%` }}
//               ></div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer with Price */}
//       <div className="px-6 py-4 border-t border-slate-50 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <CreditCard size={14} className="text-slate-400" />
//           <span className="text-xs font-bold text-slate-500">Total Paid</span>
//         </div>
//         <span className="text-lg font-black text-slate-800">
//           ₹{booking.totalAmount}
//           {booking.totalAmount === 0 && <span className="text-[10px] text-green-500 ml-1">FREE</span>}
//         </span>
//       </div>

//       {/* Decorative Gradient Overlay on Hover */}
//       <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-indigo-500/20 pointer-events-none transition-colors"></div>
//     </div>
//   );
// };

// export default BookingDetailCard;



// src/components/visitor/BookingDetailCard.jsx
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
  CreditCard,
  Zap
} from 'lucide-react';

const BookingDetailCard = ({ booking }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const visitDate = new Date(booking.visitDate);
  const isPast = visitDate < new Date().setHours(0, 0, 0, 0);
  
  const totalPasses = booking.passes?.length || 0;
  const checkedInCount = booking.passes?.filter(p => p.checkInTime).length || 0;
  const checkInPercentage = totalPasses > 0 ? (checkedInCount / totalPasses) * 100 : 0;

  const statusConfig = {
    CONFIRMED: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: <CheckCircle2 size={14}/> },
    PENDING: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={14}/> },
    CANCELLED: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <AlertCircle size={14}/> },
    EXPIRED: { color: 'text-slate-500', bg: 'bg-slate-800/50', border: 'border-slate-700', icon: <Zap size={14}/> }
  };

  const status = isPast && booking.status === 'CONFIRMED' ? 'EXPIRED' : booking.status;
  const theme = statusConfig[status] || statusConfig.PENDING;

  return (
    <div 
      onClick={() => navigate(`/booking/${booking._id}`)}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-1 border border-slate-800 hover:border-cyan-500/30 transition-all duration-500 cursor-pointer hover:translate-y-[-8px] shadow-2xl"
    >
      {/* Glossy Header Area */}
      <div className="bg-slate-800/30 rounded-t-[2.3rem] p-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${theme.bg} ${theme.color} ${theme.border} text-[9px] font-black uppercase tracking-[0.2em]`}>
            {theme.icon}
            {status}
          </div>
          <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-700 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </div>
        
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {booking.place?.name || 'Null Protocol'}
        </h3>
      </div>

      {/* Grid Specs */}
      <div className="p-6 pt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-1 text-cyan-500">
              <Calendar size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Timestamp</span>
            </div>
            <p className="text-sm font-bold text-slate-200">
              {visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-1 text-blue-500">
              <Users size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Unit Count</span>
            </div>
            <p className="text-sm font-bold text-slate-200">{totalPasses} Users</p>
          </div>
        </div>

        {/* Venue Location */}
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

        {/* Progress Bar (System Link) */}
        {status === 'CONFIRMED' && (
          <div className="px-2 pt-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entry Verification</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">{checkedInCount}/{totalPasses}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                style={{ width: `${checkInPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Footer */}
      <div className="mx-4 mb-4 px-5 py-4 bg-slate-950/50 rounded-[1.8rem] border border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-slate-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Credits Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-white tracking-tighter">
            ₹{booking.totalAmount}
          </span>
          {booking.totalAmount === 0 && (
            <span className="text-[8px] font-black bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-md">COMP</span>
          )}
        </div>
      </div>

      {/* Holographic Border Overlay */}
      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent group-hover:border-cyan-500/10 pointer-events-none transition-all duration-500"></div>
    </div>
  );
};

export default BookingDetailCard;