// src/pages/public/EventDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Shield, MapPin, Calendar, IndianRupee, Info, ArrowRight } from 'lucide-react';
import PageWrapper from '../../components/common/PageWrapper';

const EventDetails = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
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
    <PageWrapper className="min-h-screen bg-[#020617] text-slate-100 pb-20">
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
            <h3 className="text-2xl font-black text-slate-100 mb-4 tracking-tight">About the Event</h3>
            <p className="text-slate-300 leading-relaxed text-lg">
              {event.description || `Experience an exclusive gathering at ${event.name}. This event features top-tier facilities and a seamless entry process via our digital pass system.`}
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800">
            <h3 className="text-xl font-black text-slate-100 mb-6 tracking-tight">Refund & Entry Policy</h3>
            {event.refundPolicy?.isRefundable ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Before Visit</p>
                  <p className="text-2xl font-black text-indigo-600">{event.refundPolicy.beforeVisitPercent}% Refund</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Same Day</p>
                  <p className="text-2xl font-black text-indigo-600">{event.refundPolicy.sameDayPercent}% Refund</p>
                </div>
                <p className="col-span-full text-sm text-slate-400 italic">{event.refundPolicy.description}</p>
              </div>
            ) : (
              <p className="text-slate-400">Tickets for this event are non-refundable.</p>
            )}
          </div>
        </div>

        {/* RIGHT: BOOKING CARD */}
        <div className="relative">
          <div className="sticky top-24 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-slate-800 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ticket Price</p>
                <h4 className="text-4xl font-black text-slate-100 flex items-center gap-1">
                   <IndianRupee size={28} /> {event.price}
                </h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1">Availability</p>
                <p className="font-bold text-slate-200">{event.remainingCapacity} Slots Left</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                disabled={!event.isBookingEnabled}
                onClick={() => navigate(`/book/${placeId}`)}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${event.isBookingEnabled ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-xl' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {event.isBookingEnabled ? (
                  <>Secure Your Pass <ArrowRight size={18} /></>
                ) : 'Booking Closed'}
              </button>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Security Entrance Gateway</p>
                <p className="text-xs text-slate-300">Authorized security staff can access scanning and activity tools from this portal.</p>
              </div>

              {/* STAFF ENTRY BUTTON */}
              <button
                onClick={() => navigate('/security/login', { state: { placeId, placeName: event.name } })}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-slate-700 text-slate-100 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Shield size={18} /> Open Security Gateway
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
               <div className="flex items-center gap-3 text-slate-400">
                 <Info size={16} />
                 <p className="text-[11px] font-medium leading-tight">Digital QR pass will be sent to your email after successful payment.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

    </PageWrapper>
  );
};

export default EventDetails;