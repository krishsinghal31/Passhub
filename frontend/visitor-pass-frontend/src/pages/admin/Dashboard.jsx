// // src/pages/admin/Dashboard.jsx 
// import React, { useEffect, useState, useContext, useRef } from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from '../../context/AuthContext';
// import { Users, Activity, UserCog, BarChart3, UserPlus, Calendar, CreditCard } from 'lucide-react';
// import api from '../../utils/api';
// import PageWrapper from '../../components/common/PageWrapper';
// import TabNavigation from '../../components/common/TabNavigation';
// import AdminCard from '../../components/admin/AdminCard';
// import InviteAdminModal from '../../components/admin/InviteAdminModal';
// import AdminEventCard from '../../components/admin/AdminEventCard';
// import HostCard from '../../components/admin/HostCard';
// import CreateSubscriptionPlanModal from '../../components/admin/CreateSubscriptionPlanModal';
// import SeatsStatusModal from '../../components/common/SeatsStatusModal';

// const AdminDashboard = () => {
//   const { user, loading } = useContext(AuthContext);
//   const [activeTab, setActiveTab] = useState('overview');

//   const [adminCoverImage, setAdminCoverImage] = useState(() => {
//     return (
//       localStorage.getItem('admin_cover_image') ||
//       'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
//     );
//   });
//   const adminCoverInputRef = useRef(null);
  
//   // Data States
//   const [users, setUsers] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [hosts, setHosts] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [analytics, setAnalytics] = useState(null);
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     activeUsers: 0,
//     totalEvents: 0,
//     totalRevenue: 0,
//     activeSubscribers: 0
//   });

//   // UI States
//   const [dataLoading, setDataLoading] = useState(true);
//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
//   const [showSeatsModal, setShowSeatsModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);

//   useEffect(() => {
//     if (user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && !loading) {
//       fetchData();
//     }
//   }, [activeTab, user, loading]);

//   const fetchData = async () => {
//     setDataLoading(true);
//     try {
//       // 1. Always fetch high-level stats for the overview cards
//       try {
//         const statsRes = await api.get('/admin/stats');
//         if (statsRes.data.success && statsRes.data.stats) {
//           setStats(statsRes.data.stats);
//         } else {
//           console.error('Stats response invalid:', statsRes.data);
//         }
//       } catch (statsError) {
//         console.error('Stats fetch error:', statsError);
//         // Fallback: Calculate stats from users/events data
//         try {
//           const usersRes = await api.get('/admin/users');
//           const eventsRes = await api.get('/admin/events/upcoming');
//           if (usersRes.data.success) {
//             setStats(prev => ({
//               ...prev,
//               totalUsers: usersRes.data.users?.length || 0,
//               activeUsers: usersRes.data.users?.filter(u => u.isActive).length || 0
//             }));
//           }
//           if (eventsRes.data.success) {
//             setStats(prev => ({
//               ...prev,
//               totalEvents: eventsRes.data.events?.length || 0
//             }));
//           }
//         } catch (fallbackError) {
//           console.error('Fallback stats fetch error:', fallbackError);
//         }
//       }

//       // 2. Fetch Tab-Specific Data
//       if (activeTab === 'overview' || activeTab === 'users') {
//         try {
//           const usersRes = await api.get('/admin/users');
//           if (usersRes.data.success) {
//             setUsers(usersRes.data.users || []);
//           } else {
//             console.error('Users fetch failed:', usersRes.data);
//           }
//         } catch (err) {
//           console.error('Error fetching users:', err);
//         }
//       }

//       if (activeTab === 'admins' && user?.role === 'SUPER_ADMIN') {
//         try {
//           const adminsRes = await api.get('/admin/users?role=ADMIN');
//           if (adminsRes.data.success) {
//             setAdmins(adminsRes.data.users || []);
//           } else {
//             console.error('Admins fetch failed:', adminsRes.data);
//           }
//         } catch (err) {
//           console.error('Error fetching admins:', err);
//         }
//       }

//       if (activeTab === 'events') {
//         try {
//           const eventsRes = await api.get('/admin/events/upcoming');
//           if (eventsRes.data.success) {
//             setEvents(eventsRes.data.events || []);
//           } else {
//             console.error('Events fetch failed:', eventsRes.data);
//           }
//         } catch (err) {
//           console.error('Error fetching events:', err);
//         }
//       }

//       if (activeTab === 'hosts') {
//         try {
//           const hostsRes = await api.get('/admin/hosts');
//           if (hostsRes.data.success) {
//             setHosts(hostsRes.data.hosts || []);
//           } else {
//             console.error('Hosts fetch failed:', hostsRes.data);
//           }
//         } catch (err) {
//           console.error('Error fetching hosts:', err);
//         }
//       }

//       if (activeTab === 'plans' && user?.role === 'SUPER_ADMIN') {
//         const plansRes = await api.get('/admin/subscription-plans');
//         if (plansRes.data.success) setPlans(plansRes.data.plans || []);
//       }

//       if (activeTab === 'analytics' && user?.role === 'SUPER_ADMIN') {
//         const [peakRes, trafficRes] = await Promise.all([
//           api.get('/analytics/admin/peak-activity'),
//           api.get('/analytics/admin/traffic-by-place')
//         ]);
//         setAnalytics({
//           peak: peakRes.data.data || [],
//           traffic: trafficRes.data.data || []
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setDataLoading(false);
//     }
//   };

//   const handleDisableAdmin = async (adminId, reason) => {
//     try {
//       const res = await api.post(`/admin/admins/${adminId}/disable`, { reason });
//       if (res.data.success) {
//         alert('Admin disabled successfully');
//         fetchData();
//       }
//     } catch (error) {
//       alert('Error: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   const handleToggleUser = async (userId, currentStatus) => {
//     const action = currentStatus ? 'disable' : 'enable';
//     if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

//     try {
//       const res = await api.post(`/admin/users/${userId}/toggle`, {
//         reason: `${action}d by admin`
//       });
//       if (res.data.success) {
//         fetchData();
//       }
//     } catch (error) {
//       alert('Error: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   const handleSeatsStatus = (event) => {
//     setSelectedEvent(event);
//     setShowSeatsModal(true);
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//     </div>
//   );

//   if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
//     return <Navigate to="/login" replace />;
//   }

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Activity },
//     { id: 'users', label: 'All Users', icon: Users, count: stats.totalUsers },
//     { id: 'events', label: 'Events', icon: Calendar, count: stats.totalEvents },
//     { id: 'hosts', label: 'Hosts', icon: UserCog },
//     ...(user?.role === 'SUPER_ADMIN' ? [
//       { id: 'admins', label: 'Admins', icon: UserCog, count: admins.length },
//       { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//       { id: 'plans', label: 'Plans', icon: CreditCard }
//     ] : [])
//   ];

//   return (
//     <PageWrapper className="min-h-screen bg-slate-50 py-8 px-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header */}
//         <div className="mb-10 flex justify-between items-end">
//           <div>
//             <h1 className="text-4xl font-black text-slate-800 tracking-tight">
//               {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Portal
//             </h1>
//             <p className="text-slate-500 font-medium">System-wide monitoring and management</p>
//           </div>
//           <div className="flex items-center gap-6">
//             {user?.role === 'SUPER_ADMIN' && activeTab === 'admins' && (
//               <button
//                 onClick={() => setShowInviteModal(true)}
//                 className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-all font-bold shadow-lg shadow-indigo-100"
//               >
//                 <UserPlus size={18} /> Invite Admin
//               </button>
//             )}

//             <div className="relative hidden sm:block">
//               <img
//                 src={adminCoverImage}
//                 alt="Admin cover"
//                 className="h-24 w-56 object-cover rounded-[1.25rem] shadow-lg border border-slate-100"
//               />
//               <button
//                 type="button"
//                 onClick={() => adminCoverInputRef.current?.click()}
//                 className="absolute bottom-3 right-3 px-3 py-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md border border-slate-100"
//               >
//                 Change
//               </button>
//               <input
//                 ref={adminCoverInputRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) => {
//                   const file = e.target.files?.[0];
//                   if (!file) return;
//                   const reader = new FileReader();
//                   reader.onloadend = () => {
//                     const dataUrl = reader.result;
//                     if (typeof dataUrl === 'string') {
//                       setAdminCoverImage(dataUrl);
//                       localStorage.setItem('admin_cover_image', dataUrl);
//                     }
//                   };
//                   reader.readAsDataURL(file);
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Stats Summary (Overview) */}
//         {/* {activeTab === 'overview' && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//             <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
//             <StatCard title="Live Events" value={stats.totalEvents} icon={<Calendar />} color="text-emerald-600" bg="bg-emerald-50" />
//             <StatCard title="Active Subs" value={stats.activeSubscribers} icon={<Activity />} color="text-purple-600" bg="bg-purple-50" />
//             <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={<BarChart3 />} color="text-orange-600" bg="bg-orange-50" />
//           </div>
//         )} */}
 
// {/* Overview cards moved below tabs */}

//         <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

//         <div className="mt-8">
//           {dataLoading ? (
//             <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>
//           ) : (
//             <div className="animate-in fade-in duration-500">
//               {activeTab === 'overview' && (
//                 <div className="grid md:grid-cols-4 gap-6 mb-8">
//                   <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
//                     <Users className="w-10 h-10 mb-3 opacity-80" />
//                     <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
//                     <p className="text-blue-100">Total Users</p>
//                   </div>

//                   <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
//                     <Activity className="w-10 h-10 mb-3 opacity-80" />
//                     <p className="text-3xl font-bold mb-1">{stats.totalEvents}</p>
//                     <p className="text-green-100">Live Events</p>
//                   </div>

//                   <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
//                     <UserCog className="w-10 h-10 mb-3 opacity-80" />
//                     <p className="text-3xl font-bold mb-1">{stats.activeSubscribers}</p>
//                     <p className="text-purple-100">Active Subs</p>
//                   </div>

//                   <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
//                     <BarChart3 className="w-10 h-10 mb-3 opacity-80" />
//                     <p className="text-3xl font-bold mb-1">₹{stats.totalRevenue}</p>
//                     <p className="text-orange-100">Revenue</p>
//                   </div>
//                 </div>
//               )}

//               {/* Users List */}
//               {activeTab === 'users' && (
//                 <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
//                   <table className="w-full text-left">
//                     <thead className="bg-slate-50 border-b border-slate-100">
//                       <tr>
//                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
//                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
//                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
//                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-50">
//                       {users.map((u) => (
//                         <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
//                           <td className="px-8 py-5">
//                             <div className="font-bold text-slate-700">{u.name}</div>
//                             <div className="text-xs text-slate-400">{u.email}</div>
//                           </td>
//                           <td className="px-8 py-5">
//                             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{u.role}</span>
//                           </td>
//                           <td className="px-8 py-5">
//                             <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
//                             <span className="text-xs font-bold text-slate-600">{u.isActive ? 'Active' : 'Disabled'}</span>
//                           </td>
//                           <td className="px-8 py-5 text-right">
//                             {u.role !== 'SUPER_ADMIN' && (
//                               <button
//                                 onClick={() => handleToggleUser(u._id, u.isActive)}
//                                 className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
//                               >
//                                 {u.isActive ? 'Disable' : 'Enable'}
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {/* Events Grid */}
//               {activeTab === 'events' && (
//                 <div className="grid md:grid-cols-3 gap-8">
//                   {events.map(event => (
//                     <AdminEventCard key={event._id} event={event} onEventUpdate={fetchData} onSeatsStatus={handleSeatsStatus} />
//                   ))}
//                 </div>
//               )}

//               {/* Hosts List */}
//               {activeTab === 'hosts' && (
//                 <div className="grid md:grid-cols-3 gap-8">
//                   {hosts.map(host => <HostCard key={host._id} host={host} />)}
//                 </div>
//               )}

//               {/* Admins View */}
//               {activeTab === 'admins' && (
//                 <div className="grid md:grid-cols-3 gap-8">
//                   {admins.map(admin => <AdminCard key={admin._id} admin={admin} onDisable={handleDisableAdmin} />)}
//                 </div>
//               )}

//               {/* Plans Tab */}
//               {activeTab === 'plans' && (
//                 <div className="space-y-6">
//                   <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                       <div>
//                         <h3 className="text-xl font-black text-slate-800 mb-1">Plan Management</h3>
//                         <p className="text-slate-400">Create, toggle, and remove subscription plans.</p>
//                       </div>
//                       <button 
//                         onClick={() => setShowCreatePlanModal(true)}
//                         className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
//                       >
//                         + Create New Plan
//                       </button>
//                     </div>
//                   </div>

//                   {plans.length === 0 ? (
//                     <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center">
//                       <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
//                       <p className="text-slate-500 font-semibold">No plans found.</p>
//                     </div>
//                   ) : (
//                     <div className="grid md:grid-cols-3 gap-8">
//                       {plans.map((plan) => (
//                         <div key={plan._id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
//                           <div className="flex items-start justify-between gap-4 mb-4">
//                             <div>
//                               <p className="text-xs font-black uppercase tracking-widest text-slate-400">
//                                 {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
//                               </p>
//                               <h4 className="text-xl font-black text-slate-800">{plan.name}</h4>
//                               <p className="text-slate-500 font-semibold mt-1">₹{plan.price} • {plan.durationDays} days</p>
//                             </div>
//                           </div>

//                           {plan.description && (
//                             <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
//                           )}

//                           {Array.isArray(plan.features) && plan.features.length > 0 && (
//                             <ul className="text-sm text-slate-600 space-y-2 mb-6 list-disc list-inside">
//                               {plan.features.slice(0, 4).map((f, idx) => (
//                                 <li key={idx}>{f}</li>
//                               ))}
//                             </ul>
//                           )}

//                           <div className="flex gap-3">
//                             <button
//                               onClick={async () => {
//                                 try {
//                                   const res = await api.patch(`/admin/subscription-plans/${plan._id}/toggle`);
//                                   if (res.data.success) fetchData();
//                                 } catch (e) {
//                                   alert('Error: ' + (e.response?.data?.message || e.message));
//                                 }
//                               }}
//                               className={`flex-1 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
//                                 plan.isActive
//                                   ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
//                                   : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
//                               }`}
//                             >
//                               {plan.isActive ? 'Deactivate' : 'Activate'}
//                             </button>
//                             <button
//                               onClick={async () => {
//                                 if (!window.confirm(`Remove plan "${plan.name}"?`)) return;
//                                 try {
//                                   const res = await api.delete(`/admin/subscription-plans/${plan._id}`);
//                                   if (res.data.success) fetchData();
//                                 } catch (e) {
//                                   alert('Error: ' + (e.response?.data?.message || e.message));
//                                 }
//                               }}
//                               className="px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
//                             >
//                               Remove
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Analytics Charts */}
//               {activeTab === 'analytics' && analytics && (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//                   <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
//                     <h3 className="text-xl font-black text-slate-800 mb-8">Peak Activity (Hourly)</h3>
//                     <div className="h-64 flex items-end justify-between gap-2">
//                       {analytics.peak.map((item, idx) => (
//                         <div key={idx} className="flex-1 flex flex-col items-center group">
//                           <div 
//                             className="w-full bg-slate-100 group-hover:bg-indigo-500 rounded-t-xl transition-all relative"
//                             style={{ height: `${(item.count / (Math.max(...analytics.peak.map(a => a.count)) || 1)) * 100}%` }}
//                           >
//                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">{item.count}</span>
//                           </div>
//                           <p className="text-[10px] font-bold text-slate-400 mt-4">{item._id}:00</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
//                     <h3 className="text-xl font-black text-slate-800 mb-8">Top Venues by Traffic</h3>
//                     <div className="space-y-4">
//                       {analytics.traffic.map((item, idx) => (
//                         <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
//                           <div>
//                             <p className="font-black text-slate-700">{item.placeName}</p>
//                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.location}</p>
//                           </div>
//                           <span className="text-2xl font-black text-indigo-600">{item.count}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       <InviteAdminModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onSuccess={fetchData} />
//       <CreateSubscriptionPlanModal isOpen={showCreatePlanModal} onClose={() => setShowCreatePlanModal(false)} onSuccess={fetchData} />
//       {showSeatsModal && selectedEvent && (
//         <SeatsStatusModal 
//           isOpen={showSeatsModal} 
//           eventId={selectedEvent._id} 
//           totalCapacity={selectedEvent.capacity} 
//           apiPath={`/admin/events/${selectedEvent._id}/booked-seats`}
//           onClose={() => setShowSeatsModal(false)} 
//         />
//       )}
//     </PageWrapper>
//   );
// };

// const StatCard = ({ title, value, icon, color, bg }) => (
//   <div className={`bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6`}>
//     <div className={`p-4 rounded-2xl ${bg} ${color}`}>
//       {React.cloneElement(icon, { size: 28 })}
//     </div>
//     <div>
//       <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
//       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
//     </div>
//   </div>
// );

// export default AdminDashboard;




// src/pages/admin/Dashboard.jsx 
import React, { useEffect, useState, useContext, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, Activity, UserCog, BarChart3, UserPlus, 
  Calendar, CreditCard, LayoutDashboard, Settings, ShieldCheck, Search
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/common/PageWrapper';
import AdminCard from '../../components/admin/AdminCard';
import InviteAdminModal from '../../components/admin/InviteAdminModal';
import AdminEventCard from '../../components/admin/AdminEventCard';
import HostCard from '../../components/admin/HostCard';
import CreateSubscriptionPlanModal from '../../components/admin/CreateSubscriptionPlanModal';
import SeatsStatusModal from '../../components/common/SeatsStatusModal';
import PassHubLogo from '../../components/common/PassHubLogo';

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const [adminCoverImage, setAdminCoverImage] = useState(() => {
    return (
      localStorage.getItem('admin_cover_image') ||
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
    );
  });
  const adminCoverInputRef = useRef(null);
  
  // Data States (Logic unchanged)
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

  // UI States (Logic unchanged)
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
      try {
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
      } catch (statsError) {
        console.error('Stats fetch error:', statsError);
      }

      if (activeTab === 'overview' || activeTab === 'users') {
        const usersRes = await api.get('/admin/users');
        if (usersRes.data.success) setUsers(usersRes.data.users || []);
      }

      if (activeTab === 'admins' && user?.role === 'SUPER_ADMIN') {
        const adminsRes = await api.get('/admin/users?role=ADMIN');
        if (adminsRes.data.success) setAdmins(adminsRes.data.users || []);
      }

      if (activeTab === 'events') {
        const eventsRes = await api.get('/admin/events/upcoming');
        if (eventsRes.data.success) setEvents(eventsRes.data.events || []);
      }

      if (activeTab === 'hosts') {
        const hostsRes = await api.get('/admin/hosts');
        if (hostsRes.data.success) setHosts(hostsRes.data.hosts || []);
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
      if (res.data.success) { toast.success('Admin access updated'); fetchData(); }
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`Confirm ${action}?`)) return;
    try {
      const res = await api.post(`/admin/users/${userId}/toggle`, { reason: `${action}d` });
      if (res.data.success) {
        toast.success(`User ${action}d successfully`);
        fetchData();
      }
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
  };

  const handleSeatsStatus = (event) => {
    setSelectedEvent(event);
    setShowSeatsModal(true);
  };

  if (loading) return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-indigo-500 font-mono">LOADING_SYSTEM...</div>;
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/login" replace />;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'hosts', label: 'Hosts', icon: UserCog },
    ...(user?.role === 'SUPER_ADMIN' ? [
      { id: 'admins', label: 'Admins', icon: ShieldCheck },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'plans', label: 'Subscription Plans', icon: CreditCard }
    ] : [])
  ];
  const activeTabTitle = navItems.find((item) => item.id === activeTab)?.label || 'Overview';

  return (
    <PageWrapper className="min-h-screen bg-[#0a0b10] text-slate-300">
      <div className="flex h-screen overflow-hidden">
        
        {/* Glass Sidebar */}
        <aside className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-white font-black tracking-tighter text-xl uppercase italic">PASSHUB</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
                  activeTab === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black">
                {user.name[0]}
              </div>
              <div className="truncate">
                <p className="text-white text-xs font-black truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold tracking-tighter">{user.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {/* Top Bar */}
          {/* <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
                {activeTab} <span className="text-xs not-italic tracking-[0.3em] font-mono text-indigo-500 opacity-50">/ADMIN_PORTAL</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               {activeTab === 'admins' && user?.role === 'SUPER_ADMIN' && (
                 <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                 >
                   <UserPlus size={16} /> Invite Admin
                 </button>
               )}
               <div className="h-10 w-40 relative group">
                  <img src={adminCoverImage} className="w-full h-full object-cover rounded-xl border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity" alt="Cover" />
                  <button onClick={() => adminCoverInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 bg-black/40 rounded-xl">Edit Grid</button>
                  <input ref={adminCoverInputRef} type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => { setAdminCoverImage(reader.result); localStorage.setItem('admin_cover_image', reader.result); };
                    reader.readAsDataURL(file);
                  }} />
               </div>
            </div>
          </header> */}
<header className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12 pb-6 border-b border-white/5">
  {/* Left Side: Title & Status */}
  <div className="flex flex-col gap-2">
    <PassHubLogo compact className="text-white mb-1" />
    <div className="flex items-center gap-3 mb-1">
      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
      <span className="text-[10px] font-mono text-indigo-500/60 tracking-[0.3em] uppercase">System Active</span>
    </div>
    
    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic flex items-baseline gap-4 leading-none">
      {activeTabTitle}
      <span className="text-xs not-italic tracking-[0.4em] font-mono text-slate-500 opacity-40">/ADMIN_PORTAL</span>
    </h2>
  </div>

  {/* Right Side: Image & Actions */}
  <div className="flex items-center gap-6">
    {/* Action Button - Scaled to match image height */}
    {activeTab === 'admins' && user?.role === 'SUPER_ADMIN' && (
      <button 
        onClick={() => setShowInviteModal(true)}
        className="h-14 bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
      >
        <UserPlus size={18} /> Provision Admin
      </button>
    )}

    {/* The Cover Image - Fixed Aspect Ratio (2:1) */}
    <div className="relative group">
      <div className="h-14 w-32 relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-xl transition-all duration-500 group-hover:border-indigo-500/50 group-hover:w-48">
        <img 
          src={adminCoverImage} 
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" 
          alt="Admin Branding" 
        />
        
        {/* Hover Overlay */}
        <button 
          onClick={() => adminCoverInputRef.current?.click()} 
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
        >
          <span className="text-[9px] font-black uppercase tracking-tighter text-white">Edit Grid</span>
        </button>
      </div>

      {/* Hidden Input */}
      <input 
        ref={adminCoverInputRef} 
        type="file" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0]; if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => { 
            setAdminCoverImage(reader.result); 
            localStorage.setItem('admin_cover_image', reader.result); 
          };
          reader.readAsDataURL(file);
        }} 
      />
      
      {/* Decorative HUD Corner */}
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-md pointer-events-none" />
    </div>
  </div>
</header>

          {dataLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-mono text-[10px] text-indigo-500 tracking-[0.2em] animate-pulse">SYNCING_DATA_STREAM...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Stats Overview Grid */}
      {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                  <StatWidget label="Total Users" value={stats.totalUsers} icon={<Users />} trend="+12%" color="indigo" />
                  <StatWidget label="Total Events" value={stats.totalEvents} icon={<Calendar />} trend="Live" color="emerald" />
                  <StatWidget label="Active Subscribers" value={stats.activeSubscribers} icon={<Activity />} trend="+4%" color="purple" />
                  <StatWidget label="Total Revenue" value={`₹${stats.totalRevenue}`} icon={<BarChart3 />} trend="+18.5%" color="orange" />
                </div>
              )}

              {/* Dynamic Content Views */}
              {activeTab === 'users' && (
                <div className="bg-[#0f111a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{u.name}</div>
                            <div className="text-[10px] font-mono text-slate-600">{u.email}</div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-2 py-1 bg-white/5 rounded text-[9px] font-black text-slate-400 border border-white/10">{u.role}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                                  <span className="text-[10px] font-bold uppercase tracking-tighter">{u.isActive ? 'Active' : 'Disabled'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             {u.role !== 'SUPER_ADMIN' && (
                               <button onClick={() => handleToggleUser(u._id, u.isActive)} className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${u.isActive ? 'text-red-500 hover:bg-red-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
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

              {activeTab === 'events' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {events.map(event => <AdminEventCard key={event._id} event={event} onEventUpdate={fetchData} onSeatsStatus={handleSeatsStatus} />)}
                </div>
              )}

              {activeTab === 'hosts' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {hosts.map(host => <HostCard key={host._id} host={host} />)}
                </div>
              )}

              {activeTab === 'admins' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {admins.map(admin => <AdminCard key={admin._id} admin={admin} onDisable={handleDisableAdmin} />)}
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-8">
                  <div className="bg-[#0f111a] border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                       <h3 className="text-xl font-black text-white italic uppercase">Subscription Plans</h3>
                       <p className="text-slate-500 text-xs font-medium">Manage platform pricing tiers and feature access.</p>
                     </div>
                     <button onClick={() => setShowCreatePlanModal(true)} className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200">Create Plan</button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {plans.map(plan => (
                      <div key={plan._id} className="bg-[#0f111a] border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="text-lg font-black text-white">{plan.name}</h4>
                          <span className={`text-[8px] font-black px-2 py-1 rounded border ${plan.isActive ? 'border-emerald-500/50 text-emerald-500' : 'border-red-500/50 text-red-500'}`}>
                            {plan.isActive ? 'ACTIVE' : 'OFFLINE'}
                          </span>
                        </div>
                        <p className="text-2xl font-black text-white mb-6">₹{plan.price}<span className="text-xs text-slate-500"> / {plan.durationDays}D</span></p>
                        <div className="space-y-3 mb-8">
                          {plan.features?.slice(0, 3).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                               <div className="w-1 h-1 bg-indigo-500 rounded-full" /> {f}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                           <button onClick={async () => {
                             const res = await api.patch(`/admin/subscription-plans/${plan._id}/toggle`);
                             if (res.data.success) fetchData();
                           }} className="flex-1 bg-white/5 border border-white/5 text-[9px] font-black uppercase py-3 rounded-xl hover:bg-white/10 transition-all">Toggle</button>
                           <button onClick={async () => {
                              if (window.confirm('Delete?')) {
                                const res = await api.delete(`/admin/subscription-plans/${plan._id}`);
                                if (res.data.success) fetchData();
                              }
                           }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                             <ShieldCheck size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#0f111a] border border-white/5 p-8 rounded-[2.5rem]">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-10">Flux Peak (Hourly)</h3>
                    <div className="h-64 flex items-end justify-between gap-1.5">
                       {analytics.peak.map((item, idx) => (
                         <div key={idx} className="flex-1 group relative flex flex-col items-center">
                            <div className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${(item.count / (Math.max(...analytics.peak.map(a => a.count)) || 1)) * 100}%` }} />
                            <span className="text-[8px] font-bold text-slate-600 mt-4">{item._id}h</span>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="bg-[#0f111a] border border-white/5 p-8 rounded-[2.5rem]">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-10">Top Grid Venues</h3>
                    <div className="space-y-4">
                      {analytics.traffic.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-indigo-600/10 hover:border-indigo-500/20 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-xs">{idx + 1}</div>
                              <div>
                                <p className="font-bold text-slate-200 text-sm">{item.placeName}</p>
                                <p className="text-[9px] font-mono text-slate-500 uppercase">{item.location}</p>
                              </div>
                           </div>
                           <span className="text-xl font-black text-indigo-400">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'analytics' && (!analytics || (!analytics.peak?.length && !analytics.traffic?.length)) && (
                <div className="bg-[#0f111a] border border-white/5 p-12 rounded-[2.5rem] text-center">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 font-semibold">No analytics data yet.</p>
                  <p className="text-slate-500 text-sm mt-2">Analytics will appear after booking and scan traffic starts.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <InviteAdminModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onSuccess={fetchData} />
      <CreateSubscriptionPlanModal isOpen={showCreatePlanModal} onClose={() => setShowCreatePlanModal(false)} onSuccess={fetchData} />
      {showSeatsModal && selectedEvent && (
        <SeatsStatusModal 
          isOpen={showSeatsModal} 
          eventId={selectedEvent._id} 
          totalCapacity={selectedEvent.capacity} 
          apiPath={`/admin/events/${selectedEvent._id}/booked-seats`}
          onClose={() => setShowSeatsModal(false)} 
        />
      )}
    </PageWrapper>
  );
};

// Sub-component for Stats
const StatWidget = ({ label, value, icon, color, trend }) => {
  const colors = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
  };

  return (
    <div className="bg-[#0f111a] border border-white/5 p-6 rounded-[2rem] relative group hover:border-white/10 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-black text-white tracking-tighter">{value}</h3>
        <span className="text-[8px] font-mono text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">{trend}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;