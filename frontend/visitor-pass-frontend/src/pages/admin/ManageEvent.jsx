// src/pages/admin/ManageEvent.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, ToggleLeft, ToggleRight, Shield, XCircle, Eye } from 'lucide-react'; // Added Eye for Seats Status
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';
import BackButton from '../../components/common/BackButton';
import SecurityPersonnelCard from '../../components/visitor/SecurityPersonnelCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import SeatsStatusModal from '../../components/common/SeatsStatusModal'; // Added import

const AdminManageEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showSeatsModal, setShowSeatsModal] = useState(false); // Added state for modal

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/admin/events/${eventId}/details`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBooking = async () => {
    try {
      const res = await api.post(`/host/places/${eventId}/toggle-booking`);
      if (res.data.success) {
        fetchEventDetails();
        alert('Booking status updated');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
    setShowToggleConfirm(false);
  };

  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    try {
      const res = await api.post(`/admin/events/${eventId}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        alert('Event cancelled. All attendees have been notified.');
        navigate('/admin');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveSecurity = async (securityId) => {
    try {
      const res = await api.delete(`/host/places/${eventId}/security/${securityId}`);
      if (res.data.success) {
        fetchEventDetails();
        alert('Security removed');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSeatsStatus = () => { // Added handler
    setShowSeatsModal(true);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!event) {
    return <PageWrapper><div>Event not found</div></PageWrapper>;
  }

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/admin" />

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
            </div>
            <button
              onClick={() => setShowToggleConfirm(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${
                event.isBookingEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {event.isBookingEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              Booking {event.isBookingEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Host Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Host Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-800">{event.host?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{event.host?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-800">{event.host?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subscription</p>
              <p className={`font-semibold ${event.host?.subscription?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {event.host?.subscription?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <Users className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{event.bookings}</p>
            <p className="text-blue-100">Total Bookings</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <DollarSign className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">₹{event.revenue || 0}</p>
            <p className="text-green-100">Revenue</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <Calendar className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{event.remainingSeats}</p>
            <p className="text-purple-100">Seats Left</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <Shield className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{event.security?.length || 0}</p>
            <p className="text-orange-100">Security</p>
          </div>
        </div>

        {/* Security Personnel */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Security Personnel</h3>
          {event.security && event.security.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {event.security.map((sec) => (
                <SecurityPersonnelCard 
                  key={sec._id} 
                  security={sec} 
                  onRemove={handleRemoveSecurity}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No security assigned</p>
          )}
        </div>

        {/* Cancel Event Button and Seats Status Button */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleSeatsStatus}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg"
          >
            <Eye className="w-5 h-5" />
            Seats Status
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg"
          >
            <XCircle className="w-5 h-5" />
            Cancel Event
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showToggleConfirm}
        title={`${event.isBookingEnabled ? 'Disable' : 'Enable'} Booking`}
        message={`Are you sure you want to ${event.isBookingEnabled ? 'disable' : 'enable'} booking?`}
        onConfirm={handleToggleBooking}
        onCancel={() => setShowToggleConfirm(false)}
        confirmText={event.isBookingEnabled ? 'Disable' : 'Enable'}
        type={event.isBookingEnabled ? 'warning' : 'success'}
      />

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Event</h3>
            <p className="text-gray-600 mb-4">
              This will refund all attendees 100% and notify them. Enter reason:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={!cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Added Seats Status Modal */}
      {showSeatsModal && (
        <SeatsStatusModal
    isOpen={showSeatsModal}
    eventId={event._id}
    totalCapacity={event.capacity}
    apiPath={`/admin/events/${event._id}/booked-seats`}  // Added apiPath for admins
    onClose={() => setShowSeatsModal(false)}
  />
      )}
    </PageWrapper>
  );
};

export default AdminManageEvent;