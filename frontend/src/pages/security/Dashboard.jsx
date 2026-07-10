import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Users, CheckCircle, XCircle, ArrowLeft, BarChart3, KeyRound, Activity, Calendar, MapPin, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';

const SecurityDashboard = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview'); // overview | work
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, occupancy: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, workRes] = await Promise.all([
          api.get(`/security/dashboard/${placeId}`),
          api.get('/security/my-assignments'),
        ]);

        if (dashRes.data.success) {
          setStats(dashRes.data.stats || { total: 0, success: 0, failed: 0, occupancy: 0 });
          setRecentScans(dashRes.data.recentScans || []);
        }
        if (workRes.data.success) {
          setAssignments(workRes.data.assignments || []);
        }
      } catch (err) {
        console.error('Failed to fetch security stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [placeId]);

  const cards = useMemo(() => ([
    { label: 'Total Scans', value: stats.total, icon: <Users className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Success', value: stats.success, icon: <CheckCircle className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Failed', value: stats.failed, icon: <XCircle className="text-red-500" />, color: 'bg-red-50' },
  ]), [stats]);

  return (
    <PageWrapper className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:text-indigo-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Security Portal</h1>
          <button
            onClick={() => navigate('/security/change-password')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 font-bold text-sm flex items-center gap-2"
          >
            <KeyRound size={16} /> Change Password
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm inline-flex gap-2 mb-8">
          <button
            onClick={() => setTab('overview')}
            className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              tab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('work')}
            className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              tab === 'work' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Work
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : tab === 'overview' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {cards.map((c) => (
                <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} color={c.color} />
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-indigo-600" size={20} />
                <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Activity</h2>
              </div>
              {recentScans.length === 0 ? (
                <p className="text-slate-500 font-semibold">No recent scans yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          s.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {s.status === 'SUCCESS' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{s.visitorName}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.type}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">
                        {new Date(s.time).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md">
                <QrCode size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">Scan Guest Pass</h2>
              <p className="text-indigo-100 mb-8 text-sm font-medium">Scan QR codes for entry / exit</p>
              <button 
                onClick={() => navigate(`/security/scanner/${placeId}`)}
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all"
              >
                Launch Camera
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="text-indigo-600" size={20} />
                  <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Assigned Work</h2>
                </div>
                <button
                  onClick={() => navigate(`/security/activity/${placeId}`)}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors"
                >
                  Activity
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 font-semibold">
                  No active assignments found.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => navigate(`/security/dashboard/${a.place?._id}`)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all hover:shadow-md ${
                        a.place?._id === placeId ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{a.place?.name || 'Event'}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-bold text-slate-500">
                            {a.place?.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={14} className="text-indigo-500" /> {a.place.location}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={14} className="text-indigo-500" />{' '}
                              {new Date(a.startsAt).toLocaleDateString()} - {new Date(a.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            a.isShiftActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {a.isShiftActive ? 'ACTIVE' : 'SCHEDULED'}
                          </span>
                          <ChevronRight className="text-slate-300" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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