// src/pages/visitor/EditEvent.jsx - COMPLETE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';
import BackButton from '../../components/common/BackButton';
import { Save, MapPin, Image, DollarSign, Shield } from 'lucide-react';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    location: '',
    image: '',
    price: 0,
    refundPolicy: {
      isRefundable: true,
      beforeVisitPercent: 80,
      sameDayPercent: 50,
      description: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/host/places/${eventId}/dashboard`);
      if (res.data.success) {
        const place = res.data.dashboard.place;
        setForm({
          name: place.name,
          location: place.location,
          image: place.image || '',
          price: place.price,
          refundPolicy: place.refundPolicy || {
            isRefundable: true,
            beforeVisitPercent: 80,
            sameDayPercent: 50,
            description: ''
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load event');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put(`/host/places/${eventId}/details-notify`, form);
      if (res.data.success) {
        alert(`Event updated! ${res.data.notified} visitors notified of changes.`);
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <BackButton to={`/manage-event/${eventId}`} />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Event Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
              <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="pl-3 text-gray-500">🎉</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 pl-2 bg-transparent focus:outline-none rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <MapPin className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full p-3 pl-3 bg-transparent focus:outline-none rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
              <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <Image className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full p-3 pl-3 bg-transparent focus:outline-none rounded-xl"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
              <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <DollarSign className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 pl-3 bg-transparent focus:outline-none rounded-xl"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-700">Refund Policy</h3>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={form.refundPolicy.isRefundable}
                  onChange={(e) => setForm({
                    ...form,
                    refundPolicy: { ...form.refundPolicy, isRefundable: e.target.checked }
                  })}
                  className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">Enable refunds</span>
              </div>

              {form.refundPolicy.isRefundable && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Before Visit Refund (%)
                    </label>
                    <input
                      type="number"
                      value={form.refundPolicy.beforeVisitPercent}
                      onChange={(e) => setForm({
                        ...form,
                        refundPolicy: { ...form.refundPolicy, beforeVisitPercent: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Same Day Refund (%)
                    </label>
                    <input
                      type="number"
                      value={form.refundPolicy.sameDayPercent}
                      onChange={(e) => setForm({
                        ...form,
                        refundPolicy: { ...form.refundPolicy, sameDayPercent: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.refundPolicy.description}
                      onChange={(e) => setForm({
                        ...form,
                        refundPolicy: { ...form.refundPolicy, description: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      rows="3"
                      placeholder="Describe your refund policy..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Note:</strong> All existing attendees will be notified via email about these changes.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditEvent;