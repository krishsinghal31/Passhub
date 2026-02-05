// src/pages/security/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Users, CheckCircle, Clock, ArrowLeft, BarChart3 } from 'lucide-react';
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';

const SecurityDashboard = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalGuests: 0, checkedIn: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/security/dashboard/${placeId}`);
        if (res.data.success) setStats(res.data.stats);
      } catch (err) {
        console.error("Failed to fetch security stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [placeId]);

  return (
    <PageWrapper className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:text-indigo-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Security Portal</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Users className="text-blue-500" />} label="Total Expected" value={stats.totalGuests} color="bg-blue-50" />
          <StatCard icon={<CheckCircle className="text-green-500" />} label="Checked In" value={stats.checkedIn} color="bg-green-50" />
          <StatCard icon={<Clock className="text-orange-500" />} label="Remaining" value={stats.pending} color="bg-orange-50" />
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scanner Button Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md">
              <QrCode size={40} />
            </div>
            <h2 className="text-2xl font-black mb-2">Scan Guest Pass</h2>
            <p className="text-indigo-100 mb-8 text-sm font-medium">Verify visitor QR codes for entry and exit</p>
            <button 
              onClick={() => navigate(`/security/scanner/${placeId}`)}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all"
            >
              Launch Camera
            </button>
          </div>

          {/* Activity Log Preview */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-indigo-600" size={20} />
                <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Activity</h2>
             </div>
             {/* Simple list placeholder */}
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle size={14}/></div>
                       <span className="text-sm font-bold text-slate-700">Guest Entry</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">2 MINS AGO</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`p-6 rounded-[2rem] ${color} border border-white/50 shadow-sm`}>
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

export default SecurityDashboard;