// src/pages/admin/Dashboard.jsx 
import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, UserCog, BarChart3, UserPlus, Calendar, CreditCard } from 'lucide-react';
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';
import TabNavigation from '../../components/common/TabNavigation';
import AdminCard from '../../components/admin/AdminCard';
import InviteAdminModal from '../../components/admin/InviteAdminModal';
import AdminEventCard from '../../components/admin/AdminEventCard';
import HostCard from '../../components/admin/HostCard';
import CreateSubscriptionPlanModal from '../../components/admin/CreateSubscriptionPlanModal';
import SeatsStatusModal from '../../components/common/SeatsStatusModal';

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [events, setEvents] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    activeSubscribers: 0
  });

  // UI States
  const [dataLoading, setDataLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && !loading) {
      fetchData();
    }
  }, [activeTab, user, loading]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // 1. Always fetch high-level stats for the overview cards
      try {
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        } else {
          console.error('Stats response invalid:', statsRes.data);
        }
      } catch (statsError) {
        console.error('Stats fetch error:', statsError);
        // Fallback: Calculate stats from users/events data
        try {
          const usersRes = await api.get('/admin/users');
          const eventsRes = await api.get('/admin/events/upcoming');
          if (usersRes.data.success) {
            setStats(prev => ({
              ...prev,
              totalUsers: usersRes.data.users?.length || 0,
              activeUsers: usersRes.data.users?.filter(u => u.isActive).length || 0
            }));
          }
          if (eventsRes.data.success) {
            setStats(prev => ({
              ...prev,
              totalEvents: eventsRes.data.events?.length || 0
            }));
          }
        } catch (fallbackError) {
          console.error('Fallback stats fetch error:', fallbackError);
        }
      }

      // 2. Fetch Tab-Specific Data
      if (activeTab === 'overview' || activeTab === 'users') {
        try {
          const usersRes = await api.get('/admin/users');
          if (usersRes.data.success) {
            setUsers(usersRes.data.users || []);
          } else {
            console.error('Users fetch failed:', usersRes.data);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      }

      if (activeTab === 'admins' && user?.role === 'SUPER_ADMIN') {
        try {
          const adminsRes = await api.get('/admin/users?role=ADMIN');
          if (adminsRes.data.success) {
            setAdmins(adminsRes.data.users || []);
          } else {
            console.error('Admins fetch failed:', adminsRes.data);
          }
        } catch (err) {
          console.error('Error fetching admins:', err);
        }
      }

      if (activeTab === 'events') {
        try {
          const eventsRes = await api.get('/admin/events/upcoming');
          if (eventsRes.data.success) {
            setEvents(eventsRes.data.events || []);
          } else {
            console.error('Events fetch failed:', eventsRes.data);
          }
        } catch (err) {
          console.error('Error fetching events:', err);
        }
      }

      if (activeTab === 'hosts') {
        try {
          const hostsRes = await api.get('/admin/hosts');
          if (hostsRes.data.success) {
            setHosts(hostsRes.data.hosts || []);
          } else {
            console.error('Hosts fetch failed:', hostsRes.data);
          }
        } catch (err) {
          console.error('Error fetching hosts:', err);
        }
      }

      if (activeTab === 'plans' && user?.role === 'SUPER_ADMIN') {
        const plansRes = await api.get('/admin/subscription-plans');
        if (plansRes.data.success) setPlans(plansRes.data.plans || []);
      }

      if (activeTab === 'analytics' && user?.role === 'SUPER_ADMIN') {
        const [peakRes, trafficRes] = await Promise.all([
          api.get('/analytics/admin/peak-activity'),
          api.get('/analytics/admin/traffic-by-place')
        ]);
        setAnalytics({
          peak: peakRes.data.data || [],
          traffic: trafficRes.data.data || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDisableAdmin = async (adminId, reason) => {
    try {
      const res = await api.post(`/admin/admins/${adminId}/disable`, { reason });
      if (res.data.success) {
        alert('Admin disabled successfully');
        fetchData();
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await api.post(`/admin/users/${userId}/toggle`, {
        reason: `${action}d by admin`
      });
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSeatsStatus = (event) => {
    setSelectedEvent(event);
    setShowSeatsModal(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'All Users', icon: Users, count: stats.totalUsers },
    { id: 'events', label: 'Events', icon: Calendar, count: stats.totalEvents },
    { id: 'hosts', label: 'Hosts', icon: UserCog },
    ...(user?.role === 'SUPER_ADMIN' ? [
      { id: 'admins', label: 'Admins', icon: UserCog, count: admins.length },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'plans', label: 'Plans', icon: CreditCard }
    ] : [])
  ];

  return (
    <PageWrapper className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Portal
            </h1>
            <p className="text-slate-500 font-medium">System-wide monitoring and management</p>
          </div>
          {user?.role === 'SUPER_ADMIN' && activeTab === 'admins' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-all font-bold shadow-lg shadow-indigo-100"
            >
              <UserPlus size={18} /> Invite Admin
            </button>
          )}
        </div>

        {/* Stats Summary (Overview) */}
        {/* {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Live Events" value={stats.totalEvents} icon={<Calendar />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="Active Subs" value={stats.activeSubscribers} icon={<Activity />} color="text-purple-600" bg="bg-purple-50" />
            <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={<BarChart3 />} color="text-orange-600" bg="bg-orange-50" />
          </div>
        )} */}
        // Find the "Stats Cards (Overview)" section and update the values to use the 'stats' state
{activeTab === 'overview' && (
  <div className="grid md:grid-cols-4 gap-6 mb-8">
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <Users className="w-10 h-10 mb-3 opacity-80" />
      {/* ✅ CHANGE THIS: Use stats.totalUsers instead of users.length */}
      <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
      <p className="text-blue-100">Total Users</p>
    </div>

    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
      <Activity className="w-10 h-10 mb-3 opacity-80" />
      {/* ✅ CHANGE THIS: Use stats.activeSubscribers or totalEvents */}
      <p className="text-3xl font-bold mb-1">{stats.totalEvents}</p>
      <p className="text-green-100">Live Events</p>
    </div>

    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <UserCog className="w-10 h-10 mb-3 opacity-80" />
      <p className="text-3xl font-bold mb-1">{stats.activeSubscribers}</p>
      <p className="text-purple-100">Active Subs</p>
    </div>

    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
      <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
      <p className="text-3xl font-bold mb-1">₹{stats.totalRevenue}</p>
      <p className="text-orange-100">Revenue</p>
    </div>
  </div>
)}

        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8">
          {dataLoading ? (
            <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>
          ) : (
            <div className="animate-in fade-in duration-500">
              
              {/* Users List */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-700">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{u.role}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className="text-xs font-bold text-slate-600">{u.isActive ? 'Active' : 'Disabled'}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            {u.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleToggleUser(u._id, u.isActive)}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                              >
                                {u.isActive ? 'Disable' : 'Enable'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Events Grid */}
              {activeTab === 'events' && (
                <div className="grid md:grid-cols-3 gap-8">
                  {events.map(event => (
                    <AdminEventCard key={event._id} event={event} onEventUpdate={fetchData} onSeatsStatus={handleSeatsStatus} />
                  ))}
                </div>
              )}

              {/* Hosts List */}
              {activeTab === 'hosts' && (
                <div className="grid md:grid-cols-3 gap-8">
                  {hosts.map(host => <HostCard key={host._id} host={host} />)}
                </div>
              )}

              {/* Admins View */}
              {activeTab === 'admins' && (
                <div className="grid md:grid-cols-3 gap-8">
                  {admins.map(admin => <AdminCard key={admin._id} admin={admin} onDisable={handleDisableAdmin} />)}
                </div>
              )}

              {/* Plans Tab */}
              {activeTab === 'plans' && (
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 text-center">
                  <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-slate-800 mb-2">Plan Management</h3>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto">Create and manage subscription tiers for hosts to publish events on the platform.</p>
                  <button 
                    onClick={() => setShowCreatePlanModal(true)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                  >
                    + Create New Plan
                  </button>
                </div>
              )}

              {/* Analytics Charts */}
              {activeTab === 'analytics' && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8">Peak Activity (Hourly)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {analytics.peak.map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group">
                          <div 
                            className="w-full bg-slate-100 group-hover:bg-indigo-500 rounded-t-xl transition-all relative"
                            style={{ height: `${(item.count / (Math.max(...analytics.peak.map(a => a.count)) || 1)) * 100}%` }}
                          >
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">{item.count}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 mt-4">{item._id}:00</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8">Top Venues by Traffic</h3>
                    <div className="space-y-4">
                      {analytics.traffic.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                          <div>
                            <p className="font-black text-slate-700">{item.placeName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.location}</p>
                          </div>
                          <span className="text-2xl font-black text-indigo-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InviteAdminModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onSuccess={fetchData} />
      <CreateSubscriptionPlanModal isOpen={showCreatePlanModal} onClose={() => setShowCreatePlanModal(false)} onSuccess={fetchData} />
      {showSeatsModal && selectedEvent && (
        <SeatsStatusModal 
          isOpen={showSeatsModal} 
          eventId={selectedEvent._id} 
          totalCapacity={selectedEvent.capacity} 
          onClose={() => setShowSeatsModal(false)} 
        />
      )}
    </PageWrapper>
  );
};

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className={`bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6`}>
    <div className={`p-4 rounded-2xl ${bg} ${color}`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

export default AdminDashboard;