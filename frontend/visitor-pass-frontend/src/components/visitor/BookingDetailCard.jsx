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
  CreditCard
} from 'lucide-react';

const BookingDetailCard = ({ booking }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const visitDate = new Date(booking.visitDate);
  const isPast = visitDate < new Date().setHours(0, 0, 0, 0);
  
  // Calculate attendance progress
  const totalPasses = booking.passes?.length || 0;
  const checkedInCount = booking.passes?.filter(p => p.checkInTime).length || 0;
  const checkInPercentage = totalPasses > 0 ? (checkedInCount / totalPasses) * 100 : 0;

  const statusConfig = {
    CONFIRMED: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <CheckCircle2 size={16}/> },
    PENDING: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Clock size={16}/> },
    CANCELLED: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertCircle size={16}/> },
    EXPIRED: { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', icon: <Clock size={16}/> }
  };

  const status = isPast && booking.status === 'CONFIRMED' ? 'EXPIRED' : booking.status;
  const theme = statusConfig[status] || statusConfig.PENDING;

  return (
    <div 
      onClick={() => navigate(`/booking/${booking._id}`)}
      className="group relative bg-white rounded-[2rem] p-1 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100 hover:-translate-y-1"
    >
      {/* Top Section with Status */}
      <div className="bg-slate-50/50 rounded-t-[1.8rem] p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${theme.bg} ${theme.color} ${theme.border} text-[10px] font-black uppercase tracking-widest`}>
            {theme.icon}
            {status}
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowRight size={20} />
          </div>
        </div>
        
        <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {booking.place?.name || 'Event Booking'}
        </h3>
      </div>

      {/* Middle Section with Icons */}
      <div className="p-6 pt-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
              <p className="text-sm font-bold text-slate-700">
                {visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Guests</p>
              <p className="text-sm font-bold text-slate-700">{totalPasses} Persons</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <MapPin size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Venue</p>
            <p className="text-sm font-bold text-slate-700 truncate">{booking.place?.location || 'Location Pending'}</p>
          </div>
        </div>

        {/* Progress Bar for Attendance (Only if Confirmed) */}
        {status === 'CONFIRMED' && totalPasses > 0 && (
          <div className="pt-2">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check-in Progress</span>
              <span className="text-[10px] font-bold text-indigo-600">{checkedInCount}/{totalPasses}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${checkInPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Price */}
      <div className="px-6 py-4 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Total Paid</span>
        </div>
        <span className="text-lg font-black text-slate-800">
          ₹{booking.totalAmount}
          {booking.totalAmount === 0 && <span className="text-[10px] text-green-500 ml-1">FREE</span>}
        </span>
      </div>

      {/* Decorative Gradient Overlay on Hover */}
      <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-indigo-500/20 pointer-events-none transition-colors"></div>
    </div>
  );
};

export default BookingDetailCard;