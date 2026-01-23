// src/pages/visitor/ManageEvent.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, ToggleLeft, ToggleRight, Shield, UserPlus, Edit, XCircle, Eye } from 'lucide-react'; // Added Eye for Seats Status
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';
import BackButton from '../../components/common/BackButton';
import SecurityPersonnelCard from '../../components/visitor/SecurityPersonnelCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import UpdateCapacityModal from '../../components/common/UpdateCapacityModal';
import UpdateDatesModal from '../../components/common/UpdateDatesModal';
import InviteSecurityModal from '../../components/common/InviteSecurityModal';
import CancelEventModal from '../../components/common/CancelEventModal';
import AnalyticsCharts from '../../components/analytics/AnalyticsCharts';
import SeatsStatusModal from '../../components/common/SeatsStatusModal'; // Added import

const ManageEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [security, setSecurity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false); // Added state for modal

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const [dashboardRes, securityRes] = await Promise.all([
        api.get(`/host/places/${eventId}/dashboard`),
        api.get(`/host/places/${eventId}/security`)
      ]);

      if (dashboardRes.data.success) {
        setEvent(dashboardRes.data.dashboard);
      }
      
      if (securityRes.data.success) {
        setSecurity(securityRes.data.security || []);
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBooking = async () => {
    try {
      const res = await api.post(`/host/places/${eventId}/toggle-booking`);
      if (res.data.success) {
        fetchEventData();
        alert(`Booking ${event.place.isBookingEnabled ? 'disabled' : 'enabled'}`);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
    setShowToggleConfirm(false);
  };

  const handleUpdateCapacity = async (newCapacity) => {
    try {
      const res = await api.patch(`/host/places/${eventId}/capacity`, {
        dailyCapacity: parseInt(newCapacity)
      });
      if (res.data.success) {
        fetchEventData();
        alert('Capacity updated');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateDates = async (dates) => {
    try {
      const res = await api.patch(`/host/events/${eventId}/dates`, {
        date: dates.startDate
      });
      if (res.data.success) {
        fetchEventData();
        alert('Dates updated. Attendees notified.');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInviteSecurity = async (data) => {
    try {
      const res = await api.post(`/host/places/${eventId}/invite-security`, data);
      if (res.data.success) {
        alert('Security invited!');
        fetchEventData();
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveSecurity = async (securityId) => {
    try {
      const res = await api.delete(`/host/places/${eventId}/security/${securityId}`);
      if (res.data.success) {
        alert('Security removed');
        fetchEventData();
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelEvent = async (reason) => {
    try {
      const res = await api.post(`/host/places/${eventId}/cancel`, { reason });
      if (res.data.success) {
        alert('Event cancelled. All visitors will receive 100% refund.');
        navigate('/dashboard');
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

  if (!event) return <PageWrapper><div>Event not found</div></PageWrapper>;

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/dashboard" />

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
                           <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.place.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{event.place.location}</span>
              </div>
            </div>
            <button
              onClick={() => setShowToggleConfirm(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${
                event.place.isBookingEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {event.place.isBookingEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              Booking {event.place.isBookingEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <Users className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{event.stats.approvedPasses}</p>
            <p className="text-indigo-100">Bookings</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <DollarSign className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">₹{event.stats.totalRevenue || 0}</p>
            <p className="text-green-100">Revenue</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <Calendar className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{event.stats.todayPasses}</p>
            <p className="text-orange-100">Today</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <Shield className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{security.length}</p>
            <p className="text-blue-100">Security</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">  {/* Updated to 5 columns for Seats Status */}
          <button
            onClick={() => setShowCapacityModal(true)}
            className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Update Capacity
          </button>

          <button
            onClick={() => setShowDatesModal(true)}
            className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Update Dates
          </button>

          <button
            onClick={() => navigate(`/edit-event/${eventId}`)}
            className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Details
          </button>

          <button
            onClick={handleSeatsStatus}  // Added Seats Status button
            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Seats Status
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Cancel Event
          </button>
        </div>

        <div className="mb-6">
          <AnalyticsCharts eventId={eventId} type="host" />
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              Security Personnel
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Invite Security
            </button>
          </div>

          {security.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {security.map((sec) => (
                <SecurityPersonnelCard 
                  key={sec._id} 
                  security={sec} 
                  onRemove={handleRemoveSecurity}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No security assigned yet.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showToggleConfirm}
        title={`${event.place.isBookingEnabled ? 'Disable' : 'Enable'} Booking`}
        message={`Are you sure you want to ${event.place.isBookingEnabled ? 'disable' : 'enable'} booking?`}
        onConfirm={handleToggleBooking}
        onCancel={() => setShowToggleConfirm(false)}
        type={event.place.isBookingEnabled ? 'warning' : 'success'}
      />

      <UpdateCapacityModal
        isOpen={showCapacityModal}
        currentCapacity={event.place.capacity}
        onUpdate={handleUpdateCapacity}
        onClose={() => setShowCapacityModal(false)}
      />

      <UpdateDatesModal
        isOpen={showDatesModal}
        currentDates={event.eventDates}
        onUpdate={handleUpdateDates}
        onClose={() => setShowDatesModal(false)}
      />

      <InviteSecurityModal
        isOpen={showInviteModal}
        onInvite={handleInviteSecurity}
        onClose={() => setShowInviteModal(false)}
      />

      <CancelEventModal
        isOpen={showCancelModal}
        eventName={event.place.name}
        onCancel={handleCancelEvent}
        onClose={() => setShowCancelModal(false)}
      />

      {/* Added Seats Status Modal */}
      {showSeatsModal && (
         <SeatsStatusModal
    isOpen={showSeatsModal}
    eventId={eventId}
    totalCapacity={event.place.capacity}
    apiPath={`/host/places/${eventId}/slots`}  
    onClose={() => setShowSeatsModal(false)}
  />
      )}
    </PageWrapper>
  );
};

export default ManageEvent;