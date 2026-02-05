import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Calendar, MapPin, Image, IndianRupee, Users, Shield, Percent, FileText, Save, X } from 'lucide-react';

const EventForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    location: '', 
    image: '',
    eventDates: { start: '', end: '' }, 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/host/place', form);
      if (res.data.success) {
        alert('Event created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
          <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <Calendar className="text-indigo-600" size={32} />
            Create New Event
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                Event Name *
              </label>
              <input 
                placeholder="Enter event name" 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                required 
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="text-indigo-600" size={18} />
                Location *
              </label>
              <input 
                placeholder="Enter event location" 
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                required 
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Image className="text-indigo-600" size={18} />
                Image URL
              </label>
              <input 
                type="url"
                placeholder="https://example.com/image.jpg" 
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })} 
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
              />
              {form.image && (
                <img src={form.image} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-xl border-2 border-gray-200" />
              )}
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={18} />
                  Start Date *
                </label>
                <input 
                  type="date" 
                  value={form.eventDates.start}
                  onChange={(e) => setForm({ ...form, eventDates: { ...form.eventDates, start: e.target.value } })} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={18} />
                  End Date *
                </label>
                <input 
                  type="date" 
                  value={form.eventDates.end}
                  onChange={(e) => setForm({ ...form, eventDates: { ...form.eventDates, end: e.target.value } })} 
                  min={form.eventDates.start}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                  required 
                />
              </div>
            </div>

            {/* Price and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <IndianRupee className="text-indigo-600" size={18} />
                  Price (₹) *
                </label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                  min="0"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="text-indigo-600" size={18} />
                  Daily Capacity *
                </label>
                <input 
                  type="number" 
                  placeholder="100" 
                  value={form.dailyCapacity}
                  onChange={(e) => setForm({ ...form, dailyCapacity: parseInt(e.target.value) || 100 })} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                  min="1"
                  required 
                />
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-indigo-600" size={20} />
                <label className="text-sm font-bold text-gray-700">Refund Policy</label>
              </div>
              
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  checked={form.refundPolicy.isRefundable}
                  onChange={(e) => setForm({ 
                    ...form, 
                    refundPolicy: { ...form.refundPolicy, isRefundable: e.target.checked }
                  })} 
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 font-semibold text-gray-700">Enable refunds</span>
              </div>
              
              {form.refundPolicy.isRefundable && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <Percent className="text-indigo-500" size={14} />
                      Refund % Before Visit
                    </label>
                    <input 
                      type="number" 
                      placeholder="80" 
                      value={form.refundPolicy.beforeVisitPercent}
                      onChange={(e) => setForm({ 
                        ...form, 
                        refundPolicy: { ...form.refundPolicy, beforeVisitPercent: parseInt(e.target.value) || 80 }
                      })} 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <Percent className="text-indigo-500" size={14} />
                      Refund % Same Day
                    </label>
                    <input 
                      type="number" 
                      placeholder="50" 
                      value={form.refundPolicy.sameDayPercent}
                      onChange={(e) => setForm({ 
                        ...form, 
                        refundPolicy: { ...form.refundPolicy, sameDayPercent: parseInt(e.target.value) || 50 }
                      })} 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">
                      Policy Description
                    </label>
                    <textarea
                      placeholder="Describe your refund policy..."
                      value={form.refundPolicy.description}
                      onChange={(e) => setForm({ 
                        ...form, 
                        refundPolicy: { ...form.refundPolicy, description: e.target.value }
                      })} 
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Create Event
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold flex items-center gap-2"
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
