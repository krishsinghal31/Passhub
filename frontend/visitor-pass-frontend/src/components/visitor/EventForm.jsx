// src/components/host/EventForm.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Calendar, MapPin, Image, IndianRupee, Users, 
  Shield, Percent, FileText, Save, X, Zap 
} from 'lucide-react';
import toast from 'react-hot-toast';

const EventForm = ({ onBeforeSubmit, onSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    location: '', 
    image: '',
    description: '',
    eventDates: { start: '', end: '' }, 
    ticketAccessMode: 'SELECT_DATE',
    price: 0,
    dailyCapacity: 100,
    refundPolicy: {
      isRefundable: true,
      beforeVisitPercent: 80,
      sameDayPercent: 50,
      description: 'Standard refund policy'
    }
  });
  const [loading, setLoading] = useState(false);

  const isMultiDayEvent = useMemo(() => {
    if (!form.eventDates?.start || !form.eventDates?.end) return false;
    const start = new Date(form.eventDates.start);
    const end = new Date(form.eventDates.end);
    return end > start;
  }, [form.eventDates?.start, form.eventDates?.end]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        ticketAccessMode: isMultiDayEvent ? form.ticketAccessMode : 'SELECT_DATE'
      };

      if (typeof onBeforeSubmit === 'function') {
        const canProceed = onBeforeSubmit(payload);
        if (!canProceed) {
          setLoading(false);
          return;
        }
      }

      const res = await api.post('/host/place', payload);
      if (res.data.success) {
        toast.success('Event created successfully');
        if (typeof onSuccess === 'function') {
          onSuccess(res.data.place || payload);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.message;
      const looksLikeSubscriptionError =
        err.response?.status === 403 && /subscription|plan|active/i.test(backendMessage || '');

      if (looksLikeSubscriptionError) {
        const start = form.eventDates?.start ? new Date(form.eventDates.start) : null;
        const end = form.eventDates?.end ? new Date(form.eventDates.end) : null;
        const eventDuration =
          start && end ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1) : undefined;

        toast.error('Active subscription required. Redirecting to plans.');
        navigate('/subscriptions', {
          state: {
            from: '/create-event',
            eventDuration
          }
        });
      } else {
        toast.error(backendMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-900/60 border-2 border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-medium";
  const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative">
          
          <div className="relative mb-10">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Zap className="text-cyan-400" fill="currentColor" size={28} />
              Create New Event
            </h2>
            <p className="text-slate-500 text-sm mt-2">Fill in the details below to list your event.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <label className={labelClasses}>
                  <FileText className="text-cyan-500" size={16} /> Event Name *
                </label>
                <input 
                  placeholder="e.g. Midnight Tech Summit" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className={inputClasses}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>
                    <MapPin className="text-cyan-500" size={16} /> Event Location *
                  </label>
                  <input 
                    placeholder="Venue name or address" 
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} 
                    className={inputClasses}
                    required 
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <Image className="text-cyan-500" size={16} /> Image URL
                  </label>
                  <input 
                    type="url"
                    placeholder="https://image-link.com" 
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })} 
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  <FileText className="text-cyan-500" size={16} /> Description / Details
                </label>
                <textarea
                  placeholder="Add event details, schedule highlights, instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClasses} min-h-[110px]`}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-2 mb-2">
                <Calendar className="text-blue-500" size={16} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Duration</span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Start Date</label>
                <input 
                  type="date" 
                  value={form.eventDates.start}
                  onChange={(e) => setForm({ ...form, eventDates: { ...form.eventDates, start: e.target.value } })} 
                  className={`${inputClasses} bg-slate-950`}
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">End Date</label>
                <input 
                  type="date" 
                  value={form.eventDates.end}
                  onChange={(e) => setForm({ ...form, eventDates: { ...form.eventDates, end: e.target.value } })} 
                  min={form.eventDates.start}
                  className={`${inputClasses} bg-slate-950`}
                  required 
                />
              </div>
            </div>

            {/* Multi-day Entry Logic */}
            {isMultiDayEvent && (
              <div className="bg-cyan-500/5 p-6 rounded-3xl border border-cyan-500/20">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4">Entry Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, ticketAccessMode: 'ALL_DAYS' })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      form.ticketAccessMode === 'ALL_DAYS'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm">Allow All Days</div>
                    <div className="text-[10px] opacity-80 font-medium">One ticket works for the whole event</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, ticketAccessMode: 'SELECT_DATE' })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      form.ticketAccessMode === 'SELECT_DATE'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm">Single Date Only</div>
                    <div className="text-[10px] opacity-80 font-medium">User picks 1 specific date</div>
                  </button>
                </div>
              </div>
            )}

            {/* Pricing and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClasses}>
                  <IndianRupee className="text-cyan-500" size={16} /> Ticket Price (₹)
                </label>
                <input 
                  type="number" 
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} 
                  className={inputClasses}
                  required 
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <Users className="text-cyan-500" size={16} /> Max Guests Per Day
                </label>
                <input 
                  type="number" 
                  value={form.dailyCapacity}
                  onChange={(e) => setForm({ ...form, dailyCapacity: parseInt(e.target.value) || 100 })} 
                  className={inputClasses}
                  required 
                />
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="text-rose-500" size={18} />
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Refund Policy</label>
                </div>
                <input 
                  type="checkbox" 
                  checked={form.refundPolicy.isRefundable}
                  onChange={(e) => setForm({ ...form, refundPolicy: { ...form.refundPolicy, isRefundable: e.target.checked } })} 
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              
              {form.refundPolicy.isRefundable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Refund % (Before Visit)</label>
                    <input 
                      type="number" 
                      value={form.refundPolicy.beforeVisitPercent}
                      onChange={(e) => setForm({ ...form, refundPolicy: { ...form.refundPolicy, beforeVisitPercent: parseInt(e.target.value) } })} 
                      className={`${inputClasses} py-3 bg-slate-950`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Refund % (Same Day)</label>
                    <input 
                      type="number" 
                      value={form.refundPolicy.sameDayPercent}
                      onChange={(e) => setForm({ ...form, refundPolicy: { ...form.refundPolicy, sameDayPercent: parseInt(e.target.value) } })} 
                      className={`${inputClasses} py-3 bg-slate-950`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl hover:bg-cyan-400 disabled:opacity-50 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                {loading ? "Creating..." : <><Save size={20} /> Create Event</>}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 transition-all font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                <X size={20} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;