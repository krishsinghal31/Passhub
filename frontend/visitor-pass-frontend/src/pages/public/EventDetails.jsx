// src/pages/public/EventDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Shield, X, Lock, Mail, Eye, EyeOff, MapPin, Calendar, Users, IndianRupee, Info, ArrowRight } from 'lucide-react';
import PageWrapper from '../../components/common/PageWrapper';

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
      } finally {
        setLoading(false);
      }
    };
    if (placeId) fetchPlace();
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
        localStorage.setItem('securityToken', res.data.token);
        localStorage.setItem('securityId', res.data.security.id);
        
        // Check if status is PENDING to force password change
        if (res.data.mustChangePassword) {
          navigate(`/security/change-password?id=${res.data.security.id}`);
        } else {
          navigate('/security/dashboard');
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid credentials or not assigned to this event');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (!event) return <div className="p-20 text-center font-bold text-slate-500">Event not found</div>;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <PageWrapper className="min-h-screen bg-white pb-20">
      {/* HERO SECTION */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img
          src={event.image || '/qr-placeholder.png'}
          alt={event.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/qr-placeholder.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 inline-block">
              {event.isBookingEnabled ? 'Live Event' : 'Closed'}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">{event.name}</h1>
            <div className="flex flex-wrap gap-6 text-white/90 font-medium">
              <span className="flex items-center gap-2"><MapPin size={18} className="text-indigo-400" /> {event.location}</span>
              <span className="flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> {formatDate(event.eventDates?.start)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        {/* LEFT: CONTENT */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">About the Event</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {event.description || `Experience an exclusive gathering at ${event.name}. This event features top-tier facilities and a seamless entry process via our digital pass system.`}
            </p>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Refund & Entry Policy</h3>
            {event.refundPolicy?.isRefundable ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Before Visit</p>
                  <p className="text-2xl font-black text-indigo-600">{event.refundPolicy.beforeVisitPercent}% Refund</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Same Day</p>
                  <p className="text-2xl font-black text-indigo-600">{event.refundPolicy.sameDayPercent}% Refund</p>
                </div>
                <p className="col-span-full text-sm text-slate-500 italic">{event.refundPolicy.description}</p>
              </div>
            ) : (
              <p className="text-slate-500">Tickets for this event are non-refundable.</p>
            )}
          </div>
        </div>

        {/* RIGHT: BOOKING CARD */}
        <div className="relative">
          <div className="sticky top-24 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 border border-slate-100 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ticket Price</p>
                <h4 className="text-4xl font-black text-slate-800 flex items-center gap-1">
                   <IndianRupee size={28} /> {event.price}
                </h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1">Availability</p>
                <p className="font-bold text-slate-700">{event.remainingCapacity} Slots Left</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                disabled={!event.isBookingEnabled}
                onClick={() => navigate(`/book/${placeId}`)}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${event.isBookingEnabled ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {event.isBookingEnabled ? (
                  <>Secure Your Pass <ArrowRight size={18} /></>
                ) : 'Booking Closed'}
              </button>

              {/* STAFF ENTRY BUTTON */}
              <button
                onClick={() => setShowSecurityModal(true)}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-slate-900 text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Shield size={18} /> Staff Entry
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <div className="flex items-center gap-3 text-slate-500">
                 <Info size={16} />
                 <p className="text-[11px] font-medium leading-tight">Digital QR pass will be sent to your email after successful payment.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY MODAL */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowSecurityModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Security Access</h3>
              <p className="text-slate-500 text-sm font-medium">Verify credentials for {event.name}</p>
            </div>

            <form onSubmit={handleSecurityLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Staff Email</label>
                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 transition-all">
                  <Mail className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="email"
                    required
                    className="w-full p-4 pl-3 bg-transparent outline-none font-bold text-slate-700"
                    placeholder="name@staff.com"
                    value={securityForm.email}
                    onChange={(e) => setSecurityForm({...securityForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">10-Digit Password</label>
                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 transition-all relative">
                  <Lock className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full p-4 pl-3 bg-transparent outline-none font-bold text-slate-700 pr-12"
                    placeholder="••••••••"
                    value={securityForm.password}
                    onChange={(e) => setSecurityForm({...securityForm, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                {loginLoading ? 'Authenticating...' : 'Enter Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default EventDetails;