// src/pages/visitor/ManageEvent.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, DollarSign, ToggleLeft, ToggleRight, 
  Shield, UserPlus, Edit, XCircle, Eye, AlertTriangle, ShieldOff 
} from 'lucide-react';
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
import SeatsStatusModal from '../../components/common/SeatsStatusModal';

const ManageEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [security, setSecurity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'capacity', 'dates', 'invite', 'cancel', 'seats', 'toggle'
  const [cancelReason, setCancelReason] = useState('');

  const fetchEventData = useCallback(async () => {
    try {
      const [dashboardRes, securityRes] = await Promise.all([
        api.get(`/host/places/${eventId}/dashboard`),
        api.get(`/host/places/${eventId}/security`)
      ]);

      if (dashboardRes.data.success) {
        setEventData(dashboardRes.data.dashboard);
      }
      if (securityRes.data.success) {
        setSecurity(securityRes.data.security || []);
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      if(error.response?.status === 403) alert("Unauthorized access to this event.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Derived States
  const isPast = eventData?.eventDates?.end && new Date(eventData.eventDates.end) < new Date().setHours(0,0,0,0);
  const isCancelled = eventData?.place?.status === 'CANCELLED';
  const isLocked = isPast || isCancelled;

  const handleToggleBooking = async () => {
    if (isLocked) return;
    try {
      const res = await api.post(`/host/places/${eventId}/toggle-booking`);
      if (res.data.success) {
        fetchEventData();
        alert(`Booking ${!eventData.place.isBookingEnabled ? 'Enabled' : 'Disabled'}`);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
    setActiveModal(null);
  };

  const handleUpdateCapacity = async (newCapacity) => {
    try {
      const res = await api.patch(`/host/places/${eventId}/capacity`, { dailyCapacity: parseInt(newCapacity) });
      if (res.data.success) {
        fetchEventData();
        alert('Capacity updated successfully');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateDates = async (dates) => {
    try {
      const res = await api.patch(`/host/events/${eventId}/dates`, {
        date: dates.startDate, 
        endDate: dates.endDate
      });
      if (res.data.success) {
        fetchEventData();
        alert('Event timeline updated. Attendees have been notified.');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInviteSecurity = async (formData) => {
  try {
    const res = await api.post('/host/assign-security', {
      name: formData.name,      
      email: formData.email,
      placeId: eventId,         
      assignmentPeriod: {
        start: formData.startDate,
        end: formData.endDate
      }
    });
    
    if (res.data.success) {
      alert("Staff assigned successfully!");
    }
  } catch (err) {
    alert(err.response?.data?.message || "Failed to assign staff");
  }
};

  const handleRemoveSecurity = async (securityId) => {
    try {
      const res = await api.delete(`/host/places/${eventId}/security/${securityId}`);
      if (res.data.success) {
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
        alert('Event cancelled. Full refunds initiated for all visitors.');
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!eventData) return <PageWrapper><div className="p-10 text-center">Event data could not be retrieved.</div></PageWrapper>;

  const activeSecurity = security.filter(s => s.isActive);
  const removedSecurity = security.filter(s => !s.isActive);

  return (
    <PageWrapper className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/dashboard" />

        {/* STATUS BANNER */}
        {isLocked && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${isCancelled ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <AlertTriangle size={20} />
            <span className="font-bold uppercase text-xs tracking-widest">
              {isCancelled ? 'Event Cancelled' : 'Event Expired/Completed'} — Management features are disabled.
            </span>
          </div>
        )}

        {/* HEADER CARD */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8 mb-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{eventData.place.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><MapPin size={18} className="text-indigo-500"/> {eventData.place.location}</span>
            </div>
          </div>
          
          <button
            disabled={isLocked}
            onClick={() => setActiveModal('toggle')}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-lg ${
              isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
              eventData.place.isBookingEnabled ? 'bg-green-50 text-green-600 hover:bg-green-100 shadow-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-100'
            }`}
          >
            {eventData.place.isBookingEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            BOOKING {eventData.place.isBookingEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* ANALYTICS PREVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bookings', val: eventData.stats.approvedPasses, color: 'from-blue-500 to-indigo-600', icon: <Users/> },
            { label: 'Total Revenue', val: `₹${eventData.stats.totalRevenue}`, color: 'from-emerald-500 to-teal-600', icon: <DollarSign/> },
            { label: 'Today\'s Attendance', val: eventData.stats.checkedIn, color: 'from-orange-500 to-pink-600', icon: <Calendar/> },
            { label: 'Security Team', val: activeSecurity.length, color: 'from-slate-700 to-slate-900', icon: <Shield/> }
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-[2rem] p-6 text-white shadow-xl transform hover:scale-105 transition-transform`}>
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">{stat.icon}</div>
              <p className="text-3xl font-black mb-1">{stat.val}</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ACTION TOOLBAR */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button disabled={isLocked} onClick={() => setActiveModal('capacity')} className="action-btn border-indigo-200 text-indigo-600 hover:bg-indigo-50"><Users/> Capacity</button>
          <button disabled={isLocked} onClick={() => setActiveModal('dates')} className="action-btn border-purple-200 text-purple-600 hover:bg-purple-50"><Calendar/> Dates</button>
          <button disabled={isLocked} onClick={() => navigate(`/edit-event/${eventId}`)} className="action-btn border-emerald-200 text-emerald-600 hover:bg-emerald-50"><Edit/> Edit Info</button>
          <button onClick={() => setActiveModal('seats')} className="action-btn border-blue-200 text-blue-600 hover:bg-blue-50"><Eye/> Seat Map</button>
          <button disabled={isLocked} onClick={() => setActiveModal('cancel')} className="action-btn border-red-100 bg-red-50 text-red-600 hover:bg-red-100 col-span-2 md:col-span-1"><XCircle/> Cancel</button>
        </div>

        <div className="mb-10"><AnalyticsCharts eventId={eventId} type="host" /></div>

        {/* SECURITY MANAGEMENT */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Shield className="text-indigo-600"/> Active Security</h3>
              {!isLocked && (
                <button onClick={() => setActiveModal('invite')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <UserPlus size={18}/> Add Personnel
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {activeSecurity.length > 0 ? activeSecurity.map(sec => (
                <SecurityPersonnelCard key={sec._id} security={sec} onRemove={handleRemoveSecurity} />
              )) : <div className="col-span-full py-10 text-center text-slate-400 italic">No active security assigned.</div>}
            </div>
          </div>

          {/* REMOVED SECURITY SECTION */}
          {removedSecurity.length > 0 && (
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 opacity-75">
               <h3 className="text-xl font-bold text-slate-500 mb-6 flex items-center gap-3"><ShieldOff/> Deactivated / Removed</h3>
               <div className="grid md:grid-cols-3 gap-4">
                 {removedSecurity.map(sec => (
                   <div key={sec._id} className="bg-white/50 p-4 rounded-2xl border border-slate-200 flex flex-col grayscale">
                      <p className="font-bold text-slate-600">{sec.email}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Status: Removed</p>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <ConfirmModal
        isOpen={activeModal === 'toggle'}
        title={`${eventData.place.isBookingEnabled ? 'Disable' : 'Enable'} Booking`}
        message={`This will immediately stop or resume ticket sales for ${eventData.place.name}.`}
        onConfirm={handleToggleBooking}
        onCancel={() => setActiveModal(null)}
        type={eventData.place.isBookingEnabled ? 'warning' : 'success'}
      />

      <UpdateCapacityModal
        isOpen={activeModal === 'capacity'}
        currentCapacity={eventData.place.capacity}
        onUpdate={handleUpdateCapacity}
        onClose={() => setActiveModal(null)}
      />

      <UpdateDatesModal
        isOpen={activeModal === 'dates'}
        currentDates={eventData.eventDates}
        onUpdate={handleUpdateDates}
        onClose={() => setActiveModal(null)}
      />

      <InviteSecurityModal
        isOpen={activeModal === 'invite'}
        onInvite={handleInviteSecurity}
        onClose={() => setActiveModal(null)}
      />

      <CancelEventModal
        isOpen={activeModal === 'cancel'}
        eventName={eventData.place.name}
        onCancel={handleCancelEvent}
        onClose={() => setActiveModal(null)}
      />

      {activeModal === 'seats' && (
        <SeatsStatusModal
          isOpen={true}
          eventId={eventId}
          totalCapacity={eventData.place.capacity}
          apiPath={`/host/places/${eventId}/slots`}
          onClose={() => setActiveModal(null)}
        />
      )}
      
      <style jsx>{`
        .action-btn {
          @apply flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed;
        }
      `}</style>
    </PageWrapper>
  );
};

export default ManageEvent;