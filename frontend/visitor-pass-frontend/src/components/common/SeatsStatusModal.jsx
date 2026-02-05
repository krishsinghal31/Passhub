// frontend/visitor-pass-frontend/src/components/common/SeatsStatusModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Users } from 'lucide-react';
import api from '../../utils/api';

const SeatsStatusModal = ({ isOpen, eventId, totalCapacity, onClose, apiPath }) => {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  

  useEffect(() => {
    if (isOpen && eventId) {
      fetchBookedSeats();
    }
  }, [isOpen, eventId]);

  const fetchBookedSeats = async () => {
    try {
      setError(null);
      const res = await api.get(apiPath);
      if (res.data.success) {
        // Extract slotNumbers from the slots array (based on your getSlots controller)
        const bookedSlotNumbers = res.data.slots.map(slot => slot.slotNumber);
        setBookedSeats(bookedSlotNumbers || []);
      } else {
        setError('Failed to load seats data.');
      }
    } catch (err) {
      console.error('Error fetching booked seats:', err);
      setError('Unable to load seats status. Please check your connection or try again.');
      // Do NOT trigger logout here—handle gracefully
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSeatBooked = (seatNumber) => bookedSeats.includes(seatNumber);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <h3 className="text-2xl font-bold text-gray-800">Seats Status</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchBookedSeats} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  Total Capacity: <span className="font-semibold">{totalCapacity}</span>
                </p>
                <p className="text-gray-600">
                  Booked: <span className="font-semibold text-green-600">{bookedSeats.length}</span> | 
                  Available: <span className="font-semibold text-yellow-600">{totalCapacity - bookedSeats.length}</span>
                </p>
              </div>

              <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                {Array.from({ length: totalCapacity }, (_, i) => i + 1).map(seatNumber => (
                  <div
                    key={seatNumber}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                      isSeatBooked(seatNumber)
                        ? 'bg-green-500 text-white shadow-md'  // Green for booked
                        : 'bg-yellow-200 text-yellow-800 border-2 border-yellow-300'  // Yellow for available
                    }`}
                  >
                    {seatNumber}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeatsStatusModal;