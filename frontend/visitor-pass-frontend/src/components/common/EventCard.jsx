import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, IndianRupee, ArrowRight, Clock } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  const eventName = event.title || event.name;
  const eventImage = event.place?.images?.[0] || event.image;
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
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1">
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
              ? 'bg-green-500 text-white' 
              : 'bg-indigo-600 text-white'
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
        <h3 className="text-xl font-black text-gray-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {eventName}
        </h3>
        
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{eventLocation}</span>
          </div>
          
          {eventDate && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                {formatDate(eventDate)}
                {endDate && eventDate !== endDate && ` - ${formatDate(endDate)}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm font-medium">
              {availableSeats !== undefined && totalCapacity !== undefined
                ? `${availableSeats} of ${totalCapacity} seats available`
                : `${totalCapacity || 'N/A'} capacity`}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/book/${eventId}`)}
            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            Book Now <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate(`/places/${eventId}`)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold border border-gray-200"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
