// src/pages/security/ChangePassword.jsx 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.put('/auth/update-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      if (res.data.success) {
        alert('Password updated successfully! Please login again with your new credentials.');
        localStorage.removeItem('token');
        localStorage.removeItem('securityToken');
        //navigate('/');
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Update Security</h1>
            <p className="text-slate-500 mt-2 font-medium">Reset your account access credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                Current Password
              </label>
              <div className="relative">
                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
                  <Lock className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    className="w-full p-4 pl-3 bg-transparent outline-none font-bold text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                New Secure Password
              </label>
              <div className="relative">
                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
                  <Shield className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    className="w-full p-4 pl-3 bg-transparent outline-none font-bold text-slate-700"
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full p-4 pl-3 bg-transparent outline-none font-bold text-slate-700"
                    placeholder="Repeat password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl animate-shake">
                <p className="text-red-600 text-xs font-black uppercase tracking-tight">{error}</p>
              </div>
            )}

            {/* ✅ FIXED: Instruction Box (No <ul> inside <p>) */}
            <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-[1.5rem] p-5">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Requirements</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                   Minimum 8 characters
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                   Include numbers or symbols
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChangePassword;