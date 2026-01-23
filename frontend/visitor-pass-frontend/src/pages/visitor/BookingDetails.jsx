// src/pages/visitor/BookingDetails.jsx 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CreditCard, QrCode, Download } from 'lucide-react';
import api from '../../utils/api';
import BackButton from '../../components/common/BackButton';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPasses, setSelectedPasses] = useState([]);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await api.get(`/passes/booking/${bookingId}`); // Matches router
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      alert('Failed to load booking details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleCancelSelected = async () => {
    if (selectedPasses.length === 0) return;
    try {
      const res = await api.patch('/passes/cancel-bulk', { passIds: selectedPasses });
      if (res.data.success) {
        alert(`${selectedPasses.length} passes cancelled successfully`);
        fetchBookingDetails(); // Refresh data
        setSelectedPasses([]);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const togglePassSelection = (passId) => {
    setSelectedPasses(prev =>
      prev.includes(passId)
        ? prev.filter(id => id !== passId)
        : [...prev, passId]
    );
  };

  const statusColors = {
    CONFIRMED: 'bg-green-100 text-green-700 border-green-300',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <BackButton to="/dashboard" />

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Details</h1>
              <p className="text-gray-600">Booking ID: {booking._id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[booking.status]}`}>
              {booking.status}
            </span>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{booking.place?.name}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>{formatDate(booking.visitDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <span>{booking.place?.location}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">Guests</span>
                </div>
                <span className="font-bold text-gray-800">{booking.guestCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Total Amount</span>
                </div>
                <span className="font-bold text-gray-800">
                  ₹{booking.totalAmount}
                  {booking.totalAmount === 0 && <span className="text-xs text-green-600 ml-1">(Free)</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Passes */}
          {booking.passes && booking.passes.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Guest Passes</h3>
              {selectedPasses.length > 0 && (
                <button
                  onClick={handleCancelSelected}
                  className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Cancel Selected ({selectedPasses.length})
                </button>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {booking.passes.map((pass, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{pass.guest?.name}</p>
                        <p className="text-sm text-gray-600">{pass.guest?.email}</p>
                        {pass.slotNumber && (
                          <p className="text-xs text-indigo-600 font-semibold mt-1">Slot #{pass.slotNumber}</p>
                        )}
                      </div>
                      {pass.qrImage && (
                        <img src={pass.qrImage} alt="QR Code" className="w-16 h-16 border-2 border-white rounded-lg shadow-md bg-white p-1" />
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
                      <input
                        type="checkbox"
                        checked={selectedPasses.includes(pass._id)}
                        onChange={() => togglePassSelection(pass._id)}
                        className="w-4 h-4"
                        disabled={pass.status === 'CANCELLED'}
                      />
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        pass.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        pass.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {pass.status}
                      </span>
                      {pass.qrImage && (
                        <button className="text-indigo-600 text-xs font-semibold hover:underline flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;