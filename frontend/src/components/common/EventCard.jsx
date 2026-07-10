import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, IndianRupee, ArrowRight, Clock } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  const eventName = event.title || event.name;
  const eventImage =
    event.image ||
    event.images?.[0] ||
    event.place?.image ||
    event.place?.images?.[0] ||
    null;
  const eventLocation = event.place?.city || event.location;
  const eventPrice = event.price || 0;
  const availableSeats = event.availableSeats || event.remainingCapacity;
  const totalCapacity = event.totalCapacity || event.dailyCapacity;
  const eventId = event._id || event.id;
  const eventDate = event.date || event.eventDates?.start;
  const endDate = event.endDate || event.eventDates?.end;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="group bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-300 overflow-hidden border border-slate-800 hover:border-cyan-500/40 transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={eventImage || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&w=800&q=80'}
          alt={eventName}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-4 right-4">
          <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
            eventPrice === 0 
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-cyan-500 text-slate-950'
          }`}>
            {eventPrice === 0 ? 'Free' : `₹${eventPrice}`}
          </div>
        </div>
        {event.featured && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1.5 bg-amber-400 text-amber-900 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
              Featured
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-black text-slate-100 mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {eventName}
        </h3>
        
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center text-slate-400">
            <MapPin className="w-4 h-4 mr-2 text-cyan-500 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{eventLocation || 'Location TBD'}</span>
          </div>
          
          {eventDate && (
            <div className="flex items-center text-slate-400">
              <Calendar className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                {formatDate(eventDate)}
                {endDate && eventDate !== endDate && ` - ${formatDate(endDate)}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-slate-400">
            <Users className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
            <span className="text-sm font-medium">
              {availableSeats !== undefined && totalCapacity !== undefined
                ? `${availableSeats} of ${totalCapacity} seats available`
                : `${totalCapacity || 'N/A'} capacity`}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => navigate(`/book/${eventId}`)}
            className="flex-1 bg-cyan-500 text-slate-950 px-4 py-3 rounded-xl hover:bg-cyan-400 transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            Book Now <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate(`/places/${eventId}`)}
            className="px-4 py-3 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-all font-semibold border border-slate-700"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
