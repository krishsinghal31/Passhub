admin/ActionModal.jsx
import React, { useState } from 'react';
import api from '../../utils/api';

const ActionModal = ({ type, id, onClose }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      if (type === 'disableHost') await api.post(`/admin/hosts/${id}/disable`, { reason });
      onClose();
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        <textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button onClick={handleSubmit} className="bg-primary text-white px-4 py-2 rounded">Submit</button>
        <button onClick={onClose} className="ml-2">Cancel</button>
      </div>
    </div>
  );
};

export default ActionModal;

admin/AdminCard.jsx
// src/components/admin/AdminCard.jsx
import React, { useState } from 'react';
import { UserCog, Mail, Calendar, ShieldOff, CheckCircle, XCircle } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

const AdminCard = ({ admin, onDisable }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [reason, setReason] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDisable = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for disabling this admin');
      return;
    }
    
    setDisabling(true);
    try {
      await onDisable(admin._id, reason);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to disable admin:', error);
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              admin.isActive 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                : 'bg-gray-400'
            }`}>
              <UserCog className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-800 mb-1">{admin.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span>{admin.email}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {admin.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Joined</span>
            <span className="font-medium text-gray-800">
              {formatDate(admin.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-600">Status</span>
            {admin.isActive ? (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <XCircle className="w-5 h-5" />
                Disabled
              </span>
            )}
          </div>

          {admin.disabledAt && (
            <div className="bg-red-50 rounded-lg p-3 text-sm">
              <p className="text-red-700 font-semibold mb-1">Disabled on {formatDate(admin.disabledAt)}</p>
              {admin.disabledReason && (
                <p className="text-red-600">{admin.disabledReason}</p>
              )}
            </div>
          )}
        </div>

        {admin.isActive && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ShieldOff className="w-5 h-5" />
            Disable Admin
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Disable Admin</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to disable <strong>{admin.name}</strong>? 
              Please provide a reason:
            </p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for disabling..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setReason('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable}
                disabled={disabling || !reason.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50"
              >
                {disabling ? 'Disabling...' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCard;



admin/AdminEventCard.jsx
// src/components/admin/AdminEventCard.jsx - NEW FILE
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Settings, ToggleLeft, ToggleRight, XCircle, User } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import api from '../../utils/api';

const AdminEventCard = ({ event, onEventUpdate }) => {
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


// src/components/admin/HostCard.jsx
import React from 'react';
import { User, Calendar, TrendingUp, Activity } from 'lucide-react';

const HostCard = ({ host }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const daysRemaining = host.subscription?.daysRemaining || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-800">{host.name}</h4>
          <p className="text-sm text-gray-600">{host.email}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Joined</span>
          <span className="font-medium text-gray-800">{formatDate(host.createdAt)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Events</span>
          <span className="font-bold text-indigo-600">{host.eventsCount || 0}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Active Events</span>
          <span className="font-bold text-green-600">{host.activeEvents || 0}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Revenue</span>
          <span className="font-bold text-purple-600">₹{host.totalRevenue || 0}</span>
        </div>
      </div>

      {host.subscription?.isActive && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Active Subscription</span>
          </div>
          <p className="text-xs text-green-600">
            {host.subscription.planId?.name || 'Active Plan'} - {daysRemaining} days left
          </p>
        </div>
      )}

      <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
        host.isActive 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {host.isActive ? 'Active' : 'Disabled'}
      </div>
    </div>
  );
};

export default HostCard;



// src/components/admin/InviteAdminModal.jsx
import React, { useState } from 'react';
import { X, UserPlus, Mail, User } from 'lucide-react';
import api from '../../utils/api';

const InviteAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/admin/invite-admin', form);
      if (res.data.success) {
        alert('Admin invited successfully! They will receive credentials via email.');
        setForm({ name: '', email: '' });
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Invite Admin</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
              <User className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Enter admin name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 pl-3 bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
              <Mail className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 pl-3 bg-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">📧 Email Notification</p>
            <p>The invited admin will receive an email with temporary login credentials and instructions to access the admin panel.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Invite Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteAdminModal;



admin/TrafficChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';

const TrafficChart = ({ data }) => (
  <div className="p-4">
    <Line data={data} />
  </div>
);

export default TrafficChart;



admin/UserTable.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const UserTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.users));
  }, []);

  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td><button className="bg-red-500 text-white px-2 py-1 rounded">Disable</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
