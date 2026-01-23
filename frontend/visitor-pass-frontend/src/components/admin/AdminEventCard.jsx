import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Settings, ToggleLeft, ToggleRight, XCircle, User, Eye } from 'lucide-react';  // Added Eye for Seats Status
import ConfirmModal from '../common/ConfirmModal';
import api from '../../utils/api';

const AdminEventCard = ({ event, onEventUpdate, onSeatsStatus }) => {  // Added onSeatsStatus prop
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const fillPercentage = event.capacity > 0 
    ? Math.round((event.bookings / event.capacity) * 100) 
    : 0;

  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancelling');
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post(`/admin/events/${event._id}/cancel`, {
        reason: cancelReason
      });

      if (res.data.success) {
        alert('Event cancelled successfully. All attendees have been notified.');
        setShowCancelConfirm(false);
        if (onEventUpdate) onEventUpdate();
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.eventDates?.start)} - {formatDate(event.eventDates?.end)}</span>
            </div>
          </div>
          
          {/* Booking Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            event.isBookingEnabled 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {event.isBookingEnabled ? 'Booking Open' : 'Booking Closed'}
          </div>
        </div>

        {/* Host Info */}
        <div className="bg-indigo-50 rounded-lg p-3 mb-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">Host Details</span>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Name:</strong> {event.host?.name}</p>
            <p><strong>Email:</strong> {event.host?.email}</p>
            {event.host?.subscription?.isActive && (
              <p className="text-green-600 font-medium mt-1">
                ✓ Active Subscription ({event.host.subscription.daysRemaining || 0} days left)
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{event.bookings}</p>
            <p className="text-xs text-gray-600">Bookings</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
            <p className="text-2xl font-bold text-purple-600">{event.capacity}</p>
            <p className="text-xs text-gray-600">Capacity</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">{event.security || 0}</p>
            <p className="text-xs text-gray-600">Security</p>
          </div>
        </div>

        {/* Capacity Progress */}
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/events/${event._id}/manage`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md"
          >
            <Settings className="w-4 h-4" />
            Manage
          </button>
          {/* Added Seats Status Button */}
          {onSeatsStatus && (
            <button
              onClick={() => onSeatsStatus(event)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold border border-blue-200 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Seats Status
            </button>
          )}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold border border-red-200 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancel Event
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Event</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel <strong>{event.title}</strong>? 
              This will refund all attendees 100% and notify them via email.
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation (required)..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEventCard;