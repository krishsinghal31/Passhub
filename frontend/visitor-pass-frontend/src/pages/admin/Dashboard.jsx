// src/pages/admin/Dashboard.jsx 
import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, UserCog, BarChart3, UserPlus, Calendar } from 'lucide-react';
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
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [events, setEvents] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ CRITICAL: Wait for auth to complete before rendering anything
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ CRITICAL: Redirect if not authenticated or not admin
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'users') {
        const usersRes = await api.get('/admin/users');
        if (usersRes.data.success) {
          setUsers(usersRes.data.users);
        }
      }

      if (activeTab === 'admins' && user?.role === 'SUPER_ADMIN') {
        const adminsRes = await api.get('/admin/users?role=ADMIN');
        if (adminsRes.data.success) {
          setAdmins(adminsRes.data.users);
        }
      }

      if (activeTab === 'events') {
        const eventsRes = await api.get('/admin/events/upcoming');
        if (eventsRes.data.success) {
          setEvents(eventsRes.data.events);
        }
      }

      if (activeTab === 'hosts') {
        const hostsRes = await api.get('/admin/hosts');
        if (hostsRes.data.success) {
          setHosts(hostsRes.data.hosts);
        }
      }

      if (activeTab === 'analytics') {
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
      console.error('Error fetching data:', error);
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
    try {
      const action = currentStatus ? 'disable' : 'enable';
      const confirmed = window.confirm(`Are you sure you want to ${action} this user?`);
      
      if (!confirmed) return;

      const res = await api.post(`/admin/users/${userId}/toggle`, {
        reason: `${action}d by admin`
      });
      
      if (res.data.success) {
        alert(`User ${action}d successfully`);
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'All Users', icon: Users, count: users.length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
    { id: 'hosts', label: 'Hosts', icon: UserCog, count: hosts.length },
    ...(user?.role === 'SUPER_ADMIN' ? [
      { id: 'admins', label: 'Admins', icon: UserCog, count: admins.length },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'plans', label: 'Subscription Plans', icon: BarChart3 }
    ] : [])
  ];

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Dashboard
          </h1>
          <p className="text-gray-600">Manage your platform and monitor activities</p>
        </div>

        {/* Stats Cards (Overview) */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <Users className="w-10 h-10 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{users.length}</p>
              <p className="text-blue-100">Total Users</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <Activity className="w-10 h-10 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">
                {users.filter(u => u.isActive).length}
              </p>
              <p className="text-green-100">Active Users</p>
            </div>

            {user?.role === 'SUPER_ADMIN' && (
              <>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <UserCog className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{admins.length}</p>
                  <p className="text-purple-100">Admins</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                  <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">Live</p>
                  <p className="text-orange-100">Analytics</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Data Loading State */}
        {dataLoading && activeTab !== 'overview' && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>
        )}

        {/* Tab Content - Only show when not loading */}
        {!dataLoading && (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Stats</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-green-600">
                      {users.filter(u => u.isActive).length}
                    </p>
                  </div>
                  <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-2">Disabled Users</p>
                    <p className="text-3xl font-bold text-red-600">
                      {users.filter(u => !u.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">All Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-800">{u.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleToggleUser(u._id, u.isActive)}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                                  u.isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
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
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Events</h2>
                {events.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <AdminEventCard 
                        key={event._id} 
                        event={event} 
                        onEventUpdate={fetchData}
                        onSeatsStatus={handleSeatsStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg">No upcoming events</p>
                  </div>
                )}
              </div>
            )}

            {/* Hosts Tab */}
            {activeTab === 'hosts' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">All Hosts</h2>
                {hosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hosts.map((host) => (
                      <HostCard key={host._id} host={host} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg">No hosts found</p>
                  </div>
                )}
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && user?.role === 'SUPER_ADMIN' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite Admin
                  </button>
                </div>

                {admins.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin) => (
                      <AdminCard 
                        key={admin._id} 
                        admin={admin} 
                        onDisable={handleDisableAdmin}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">No admins yet</p>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
                    >
                      Invite Admin
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Subscription Plans Tab */}
            {activeTab === 'plans' && user?.role === 'SUPER_ADMIN' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Subscription Plans</h2>
                  <button
                    onClick={() => setShowCreatePlanModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Plan
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <p className="text-gray-500 text-center py-8">Subscription plans management coming soon...</p>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Peak Activity Hours</h2>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {analytics.peak.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:from-indigo-600 hover:to-purple-600"
                          style={{ height: `${(item.count / Math.max(...analytics.peak.map(a => a.count))) * 100}%` }}
                        ></div>
                        <p className="text-xs text-gray-600 mt-2">{item._id}:00</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Traffic by Place</h2>
                  <div className="space-y-3">
                    {analytics.traffic.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800">{item.placeName}</p>
                          <p className="text-sm text-gray-600">{item.location}</p>
                        </div>
                        <span className="text-2xl font-bold text-indigo-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <InviteAdminModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={fetchData}
      />

      <CreateSubscriptionPlanModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onSuccess={fetchData}
      />

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

export default AdminDashboard;
