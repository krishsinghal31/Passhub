import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { User, Mail, Phone, Calendar, Plus, X, IndianRupee, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingForm = ({ placeId: propPlaceId, visitDate: propVisitDate }) => {
  const { placeId: routePlaceId } = useParams();
  const placeId = propPlaceId || routePlaceId;
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([{ name: '', email: '', phone: '' }]);
  const [visitDate, setVisitDate] = useState(propVisitDate || '');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const ticketAccessMode = event?.ticketAccessMode || 'SELECT_DATE';
  const isAllDaysAccess = ticketAccessMode === 'ALL_DAYS';

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await api.get(`/places/${placeId}`);
        if (res.data.success) {
          setEvent(res.data.place);

          // If host selected ALL_DAYS, we don't need the visitor to pick a date.
          if (res.data.place?.ticketAccessMode === 'ALL_DAYS' && res.data.place?.eventDates?.start) {
            const startISO = new Date(res.data.place.eventDates.start).toISOString().split('T')[0];
            setVisitDate(startISO);
          }
        }
      } catch (error) {
        console.error('Error fetching place:', error);
        toast.error('Error loading event details');
      } finally {
        setFetching(false);
      }
    };
    if (placeId) {
      fetchPlace();
    }
  }, [placeId]);

  const addGuest = () => {
    if (guests.length < 6) {
      setGuests([...guests, { name: '', email: '', phone: '' }]);
    }
  };

  const removeGuest = (index) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index, field, value) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAllDaysAccess && !visitDate) {
      toast.error('Please select a visit date');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/passes/request', { 
        placeId, 
        visitDate: visitDate || event?.eventDates?.start,
        guests: guests.filter(g => g.name.trim() !== '')
      });
      
      if (res.data.success) {
        if (res.data.amountToPay > 0) {
          toast.success(`Booking created. Amount due: ₹${res.data.amountToPay}`);
          navigate(`/payment/${res.data.bookingId}`, {
            state: { amount: res.data.amountToPay, eventName: event?.name || 'Event' }
          });
        } else {
          toast.success('Booking confirmed. Free passes were sent by email.');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">Event not found</p>
        </div>
      </div>
    );
  }

  const totalAmount = event.price * guests.filter(g => g.name.trim()).length;
  const validGuests = guests.filter(g => g.name.trim());

  return (
    <div className="min-h-screen bg-[#020617] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Event Info Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-6">
            {event.image && (
              <img 
                src={event.image} 
                alt={event.name} 
                className="w-32 h-32 rounded-2xl object-cover border-4 border-indigo-100"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-100 mb-3">{event.name}</h1>
              <div className="space-y-2">
                <div className="flex items-center text-slate-300">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                  <span className="font-medium">
                    {new Date(event.eventDates?.start).toLocaleDateString()} - {new Date(event.eventDates?.end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Users className="w-5 h-5 mr-2 text-orange-500" />
                  <span className="font-medium">
                    {event.remainingCapacity || 0} seats available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl font-black text-slate-100 mb-8 flex items-center gap-3">
            <Users className="text-indigo-600" size={28} />
            Guest Information
          </h2>
          
          {/* Visit Date */}
          {!isAllDaysAccess ? (
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                Visit Date *
              </label>
              <input 
                type="date" 
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={event.eventDates?.end ? new Date(event.eventDates.end).toISOString().split('T')[0] : ''}
                className="w-full p-4 border-2 border-slate-700 bg-slate-950 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                required 
              />
            </div>
          ) : (
            <div className="mb-8 bg-indigo-500/10 p-6 rounded-2xl border-2 border-indigo-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-indigo-600" size={18} />
                <h3 className="text-sm font-black text-slate-200">All Days Access</h3>
              </div>
              <p className="text-sm text-slate-400">
                Your booking will generate QR passes for every day of this event.
              </p>
            </div>
          )}

          {/* Guests */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-300 flex items-center gap-2">
                <Users className="text-indigo-600" size={18} />
                Guests (Max 6) *
              </label>
              {guests.length < 6 && (
                <button 
                  type="button"
                  onClick={addGuest}
                  className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-2 text-sm"
                >
                  <Plus size={18} /> Add Guest
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {guests.map((guest, i) => (
                <div key={i} className="p-6 border-2 border-slate-800 rounded-2xl hover:border-indigo-500/40 transition-all bg-slate-950/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-300">Guest {i + 1}</span>
                    {guests.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeGuest(i)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                        <User className="text-indigo-500" size={14} />
                        Full Name *
                      </label>
                      <input 
                        placeholder="Enter guest name" 
                        value={guest.name} 
                        onChange={(e) => updateGuest(i, 'name', e.target.value)} 
                        className="w-full p-3 border-2 border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                        <Mail className="text-indigo-500" size={14} />
                        Email
                      </label>
                      <input 
                        type="email"
                        placeholder="guest@example.com" 
                        value={guest.email} 
                        onChange={(e) => updateGuest(i, 'email', e.target.value)} 
                        className="w-full p-3 border-2 border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                        <Phone className="text-indigo-500" size={14} />
                        Phone
                      </label>
                      <input 
                        type="tel"
                        placeholder="+91 9876543210" 
                        value={guest.phone} 
                        onChange={(e) => updateGuest(i, 'phone', e.target.value)} 
                        className="w-full p-3 border-2 border-slate-700 bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-indigo-500/10 p-6 rounded-2xl mb-8 border-2 border-indigo-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <IndianRupee className="text-indigo-600" size={20} />
                Total Amount
              </span>
              <span className="text-2xl font-black text-indigo-600">
                ₹{totalAmount}
              </span>
            </div>
            {event.price === 0 && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle size={18} />
                This is a free event!
              </div>
            )}
            <p className="text-sm text-slate-400 mt-2">
              {validGuests.length} guest{validGuests.length !== 1 ? 's' : ''} × ₹{event.price} = ₹{totalAmount}
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            disabled={loading || validGuests.length === 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Booking...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                {event.price === 0 ? 'Confirm Free Booking' : 'Proceed to Payment'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
