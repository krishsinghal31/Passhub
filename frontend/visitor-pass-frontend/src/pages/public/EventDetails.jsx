// src/pages/public/EventDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Shield, X, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const EventDetails = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityForm, setSecurityForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await api.get(`/places/${placeId}`);
        if (res.data.success) {
          setEvent(res.data.place);
        }
      } catch (error) {
        console.error('Error fetching place:', error);
        alert('Error loading event details');
      } finally {
        setLoading(false);
      }
    };
    if (placeId) {
      fetchPlace();
    }
  }, [placeId]);

  const handleSecurityLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await api.post('/security/login', {
        email: securityForm.email,
        password: securityForm.password,
        placeId
      });
      
      if (res.data.success) {
        // Store security token separately
        localStorage.setItem('securityToken', res.data.token);
        localStorage.setItem('securityId', res.data.security.id);
        localStorage.setItem('securityEmail', res.data.security.email);
        
        // Navigate to security dashboard
        navigate('/security/dashboard');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Invalid credentials or not assigned to this event'));
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
    </div>
  );
  
  if (!event) return <div className="p-6 text-center">Event not found</div>;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      {event.image && (
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-96 object-cover rounded-lg mb-4"
          onError={(e) => { e.target.src = '/qr-placeholder.png'; }}
        />
      )}
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-4">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {event.description || `Join us for an amazing event at ${event.name}!`}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="font-semibold">Location:</p>
            <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
          </div>
          <div>
            <p className="font-semibold">Price:</p>
            <p className="text-gray-600 dark:text-gray-400">
              ₹{event.price} {event.price === 0 && <span className="text-green-600">(Free Event)</span>}
            </p>
          </div>
          <div>
            <p className="font-semibold">Start Date:</p>
            <p className="text-gray-600 dark:text-gray-400">{formatDate(event.eventDates?.start)}</p>
          </div>
          <div>
            <p className="font-semibold">End Date:</p>
            <p className="text-gray-600 dark:text-gray-400">{formatDate(event.eventDates?.end)}</p>
          </div>
          <div>
            <p className="font-semibold">Capacity:</p>
            <p className="text-gray-600 dark:text-gray-400">
              {event.remainingCapacity || 0} / {event.dailyCapacity} seats available
            </p>
          </div>
          <div>
            <p className="font-semibold">Booking Status:</p>
            <p className={event.isBookingEnabled ? 'text-green-600' : 'text-red-600'}>
              {event.isBookingEnabled ? 'Open for Booking' : 'Booking Closed'}
            </p>
          </div>
        </div>

        {event.refundPolicy && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="font-semibold mb-2">Refund Policy:</p>
            {event.refundPolicy.isRefundable ? (
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                <li>Before visit: {event.refundPolicy.beforeVisitPercent}% refund</li>
                <li>Same day: {event.refundPolicy.sameDayPercent}% refund</li>
                {event.refundPolicy.description && <li className="mt-2">{event.refundPolicy.description}</li>}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">No refunds available for this event.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {event.isBookingEnabled && (
          <button
            onClick={() => navigate(`/book/${placeId}`)}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            Book Now
          </button>
        )}
        
        <button
          onClick={() => setShowSecurityModal(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
        >
          <Shield className="w-5 h-5" />
          Enter as Security
        </button>
      </div>

      {/* Security Login Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Security Login</h3>
                  <p className="text-sm text-gray-500">{event.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSecurityModal(false);
                  setSecurityForm({ email: '', password: '' });
                  setShowPassword(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSecurityLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                  <Mail className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="email"
                    value={securityForm.email}
                    onChange={(e) => setSecurityForm({ ...securityForm, email: e.target.value })}
                    className="w-full p-3 pl-3 bg-transparent focus:outline-none"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                    <Lock className="w-5 h-5 text-gray-400 ml-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securityForm.password}
                      onChange={(e) => setSecurityForm({ ...securityForm, password: e.target.value })}
                      className="w-full p-3 pl-3 pr-12 bg-transparent focus:outline-none"
                      placeholder="Enter your 10-digit password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <strong>ℹ️ Note:</strong> If you're assigned as security for this event, you should have received login credentials via email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Login as Security
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Not assigned to this event?{' '}
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Cancel
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;