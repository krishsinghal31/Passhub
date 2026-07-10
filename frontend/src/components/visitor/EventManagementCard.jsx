// src/components/visitor/EventManagementCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, TrendingUp, Settings, CheckCircle, XCircle } from 'lucide-react';

const EventManagementCard = ({ event }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isCompleted = event.status === 'completed' || new Date(event.endDate) < new Date();
  const fillPercentage = event.capacity > 0 ? Math.round((event.bookings / event.capacity) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800">
              {event.title || event.place?.name}
            </h3>
            {isCompleted ? (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)} - {formatDate(event.endDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.place?.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{event.bookings || 0}</p>
          <p className="text-xs text-gray-600">Bookings</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{event.capacity || 0}</p>
          <p className="text-xs text-gray-600">Capacity</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">₹{event.revenue || 0}</p>
          <p className="text-xs text-gray-600">Revenue</p>
        </div>
      </div>

      {/* Fill Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Occupancy</span>
          <span className="text-sm font-semibold text-gray-800">{fillPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              fillPercentage >= 90 ? 'bg-red-500' :
              fillPercentage >= 70 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Seats Remaining */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Seats Remaining</span>
        </div>
        <span className="text-lg font-bold text-indigo-600">
          {Math.max(0, (event.capacity || 0) - (event.bookings || 0))}
        </span>
      </div>

      {/* Manage Button */}
      <button
        onClick={() => navigate(`/manage-event/${event._id}`)}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <Settings className="w-5 h-5" />
        Manage Event
      </button>
    </div>
  );
};

export default EventManagementCard;