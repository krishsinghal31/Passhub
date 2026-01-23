import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, UsersIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Handle both event structure from public API and direct place structure
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="relative">
        <img
          src={eventImage || '/qr-placeholder.png'}
          alt={eventName}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/qr-placeholder.png';
          }}
        />
        <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {eventPrice === 0 ? 'Free' : `₹${eventPrice}`}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">{eventName}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <MapPinIcon className="w-5 h-5 mr-2 text-indigo-500" />
            <span className="text-sm">{eventLocation}</span>
          </div>
          
          {eventDate && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <CalendarIcon className="w-5 h-5 mr-2 text-green-500" />
              <span className="text-sm">
                {formatDate(eventDate)}
                {endDate && eventDate !== endDate && ` - ${formatDate(endDate)}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <UsersIcon className="w-5 h-5 mr-2 text-orange-500" />
            <span className="text-sm">
              {availableSeats !== undefined && totalCapacity !== undefined
                ? `Seats: ${availableSeats}/${totalCapacity}`
                : `Capacity: ${totalCapacity || 'N/A'}`}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/book/${eventId}`)}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Book Now
          </button>
          <button
            onClick={() => navigate(`/places/${eventId}`)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;