import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const placeName = booking.place?.name || 'Unknown Event';
  const visitDate = booking.visitDate ? new Date(booking.visitDate).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'N/A';
  const totalAmount = booking.totalAmount || 0;
  const guestCount = booking.guestCount || booking.passes?.length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'CANCELLED':
        return <XCircle className="text-red-600" size={18} />;
      default:
        return <Clock className="text-yellow-600" size={18} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-black text-xl text-gray-900 mb-2">{placeName}</h3>
          {booking.place?.location && (
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="text-sm">{booking.place.location}</span>
            </div>
          )}
        </div>
        <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${getStatusColor(booking.status)}`}>
          {getStatusIcon(booking.status)}
          <span className="font-bold text-xs uppercase tracking-widest">{booking.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Visit Date</p>
            <p className="text-sm font-bold">{visitDate}</p>
          </div>
        </div>
        <div className="flex items-center text-gray-600">
          <Users className="w-5 h-5 mr-2 text-orange-500" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Guests</p>
            <p className="text-sm font-bold">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-4 border border-indigo-100">
        <div className="flex items-center gap-2">
          <IndianRupee className="text-indigo-600" size={20} />
          <span className="text-xs font-semibold text-gray-600 uppercase">Total Amount</span>
        </div>
        <span className="text-2xl font-black text-indigo-600">
          ₹{totalAmount} {totalAmount === 0 && <span className="text-green-600 text-sm">(Free)</span>}
        </span>
      </div>

      {booking.passes && booking.passes.length > 0 && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Passes</p>
          <div className="flex flex-wrap gap-2">
            {booking.passes.map((pass, idx) => (
              <div 
                key={idx} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  pass.status === 'APPROVED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {pass.guest?.name || `Guest ${idx + 1}`} - {pass.status}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(`/booking/${booking._id}`)}
        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
      >
        View Details <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default BookingCard;
