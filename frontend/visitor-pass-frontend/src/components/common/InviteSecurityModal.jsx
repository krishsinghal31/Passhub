// src/components/common/InviteSecurityModal.jsx
import React, { useState } from 'react';
import { X, Mail, ShieldCheck, Info, User, Calendar } from 'lucide-react';

const InviteSecurityModal = ({ isOpen, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    name: '', // ✅ Added Name field
    email: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Check dates
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date");
      return;
    }

    setLoading(true);
    try {
      // ✅ Now passes name, email, and dates to the parent handler
      await onInvite(formData);
      
      // Reset form on success
      setFormData({ name: '', email: '', startDate: '', endDate: '' });
      onClose();
    } catch (error) {
      console.error("Assignment Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <ShieldCheck size={28} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Assign Staff</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ✅ Personnel Name Field */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Personnel Name</label>
            <div className="group flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <User className="w-5 h-5 text-slate-400 ml-4" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 pl-3 bg-transparent focus:outline-none font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="Full Name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Work Email</label>
            <div className="group flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <Mail className="w-5 h-5 text-slate-400 ml-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 pl-3 bg-transparent focus:outline-none font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="staff@example.com"
                required
              />
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Access From</label>
              <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-4 bg-transparent focus:outline-none text-xs font-bold text-slate-700"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Access Until</label>
              <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full p-4 bg-transparent focus:outline-none text-xs font-bold text-slate-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 rounded-[1.5rem] p-4 flex gap-3 border border-indigo-100">
            <Info className="text-indigo-600 shrink-0" size={18} />
            <div className="space-y-1">
                <p className="text-[10px] text-indigo-700 font-black uppercase tracking-tight leading-relaxed">
                   Unified Account Protocol
                </p>
                <p className="text-[9px] text-indigo-500 font-bold leading-tight">
                   If the user isn't registered, an account will be created with a temporary password. Existing users will see this event in their Work tab.
                </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-100 hover:bg-indigo-600 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Assigning...
                </>
            ) : "Confirm Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteSecurityModal;