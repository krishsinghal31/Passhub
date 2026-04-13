// import React, { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../context/AuthContext';
// import api from '../../utils/api';
// import BookingCard from '../../components/visitor/BookingCard';
// import { Calendar, Users, Ticket, Plus, TrendingUp, Clock, CheckCircle, ArrowRight, UserCircle2 } from 'lucide-react';

// const Dashboard = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [bookings, setBookings] = useState([]);
//   const [passes, setPasses] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     activePasses: 0,
//     totalBookings: 0,
//     hostedEvents: 0
//   });

//   const [activeTab, setActiveTab] = useState('overview'); // overview | passes | bookings | hosted | profile

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Faster: run requests in parallel
//         const [passesRes, bookingsRes, eventsRes] = await Promise.all([
//           api.get('/passes/my-passes'),
//           api.get('/passes/bookings'),
//           (user?.role === 'HOST' || user?.subscription?.isActive) ? api.get('/host/events') : Promise.resolve(null)
//         ]);

//         if (passesRes?.data?.success) {
//           const allPasses = passesRes.data.passes || [];
//           setPasses(allPasses);

//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           const active = allPasses.filter((p) => {
//             if (p.status !== 'APPROVED') return false;
//             if (p.ticketAccessMode === 'ALL_DAYS') {
//               const end = p.place?.eventDates?.end;
//               if (!end) return true;
//               const endDate = new Date(end);
//               endDate.setHours(0, 0, 0, 0);
//               return endDate >= today;
//             }
//             if (!p.visitDate) return true;
//             const v = new Date(p.visitDate);
//             v.setHours(0, 0, 0, 0);
//             return v >= today;
//           });
//           setStats(prev => ({ ...prev, activePasses: active.length }));
//         }

//         if (bookingsRes?.data?.success) {
//           const allBookings = bookingsRes.data.bookings || [];
//           setBookings(allBookings);
//           setStats(prev => ({ ...prev, totalBookings: allBookings.length }));
//         }

//         if (eventsRes?.data?.success) {
//           const hostedEvents = eventsRes.data.events || [];
//           setEvents(hostedEvents);
//           setStats(prev => ({ ...prev, hostedEvents: hostedEvents.length }));
//         }
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user) {
//       fetchData();
//     }
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 py-12 px-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
//               {user?.profilePicture ? (
//                 <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
//               ) : (
//                 <UserCircle2 size={26} className="text-indigo-600" />
//               )}
//             </div>
//             <div>
//               <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
//                 {user?.name ? `@${user.name.split(' ')[0]}` : 'Dashboard'}
//               </h1>
//               <p className="text-gray-600 text-lg">
//                 Your PassHub profile & activity
//                 {user?.role && (
//                   <span className="ml-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-black text-slate-600 uppercase tracking-widest">
//                     {user.role}
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={() => navigate('/profile')}
//               className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2"
//             >
//               <UserCircle2 size={18} /> Profile
//             </button>
//             {(user?.role === 'HOST' || user?.subscription?.isActive) && (
//               <button
//                 onClick={() => navigate('/create-event')}
//                 className="px-5 py-3 rounded-2xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all font-black flex items-center gap-2"
//               >
//                 <Plus size={18} /> Create
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-3xl p-3 shadow-xl border border-slate-100 mb-8 flex flex-wrap gap-2">
//           {[
//             { id: 'overview', label: 'Overview' },
//             { id: 'passes', label: 'Passes' },
//             { id: 'bookings', label: 'Bookings' },
//             ...(user?.role === 'HOST' || user?.subscription?.isActive ? [{ id: 'hosted', label: 'Hosted' }] : [])
//           ].map(t => (
//             <button
//               key={t.id}
//               onClick={() => setActiveTab(t.id)}
//               className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
//                 activeTab === t.id
//                   ? 'bg-indigo-600 text-white shadow-lg'
//                   : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
//               }`}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {/* Stats Cards */}
//         {activeTab === 'overview' && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <StatCard 
//             icon={<Ticket className="text-indigo-600" size={24} />}
//             title="Active Passes"
//             value={stats.activePasses}
//             color="from-indigo-500 to-indigo-600"
//           />
//           <StatCard 
//             icon={<Calendar className="text-green-600" size={24} />}
//             title="Total Bookings"
//             value={stats.totalBookings}
//             color="from-green-500 to-green-600"
//           />
//           {(user?.role === 'HOST' || user?.subscription?.isActive) && (
//             <StatCard 
//               icon={<TrendingUp className="text-purple-600" size={24} />}
//               title="Hosted Events"
//               value={stats.hostedEvents}
//               color="from-purple-500 to-purple-600"
//             />
//           )}
//         </div>
//         )}

//         {/* Active Passes Section */}
//         {activeTab === 'passes' && (
//         <section className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
//               <CheckCircle className="text-green-500" size={28} />
//               My Active Passes
//             </h2>
//             {passes.length > 0 && (
//               <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
//                 {passes.length} Active
//               </span>
//             )}
//           </div>
          
//           {passes.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {passes.map(pass => (
//                 <div key={pass._id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-100 hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-4">
//                     <div>
//                       <h3 className="font-black text-base text-gray-900 mb-1">
//                         {pass.place?.name || 'Event'}
//                       </h3>
//                       <p className="text-sm text-gray-600">Guest: {pass.guest?.name}</p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                       pass.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
//                       pass.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
//                       pass.status === 'EXPIRED' ? 'bg-slate-200 text-slate-700' :
//                       'bg-gray-100 text-gray-700'
//                     }`}>
//                       {pass.status}
//                     </span>
//                   </div>
                  
//                   {pass.qrImage && (
//                     <div className="mb-3 p-3 bg-white rounded-xl border-2 border-indigo-200">
//                       <img 
//                         src={pass.qrImage} 
//                         alt="QR Code" 
//                         className="w-full h-auto rounded-lg max-h-40 object-contain"
//                       />
//                     </div>
//                   )}
                  
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Clock size={16} />
//                     {pass.ticketAccessMode === 'ALL_DAYS' && pass.place?.eventDates?.start && pass.place?.eventDates?.end ? (
//                       <span>
//                         Valid:{' '}
//                         {new Date(pass.place.eventDates.start).toLocaleDateString()} -{' '}
//                         {new Date(pass.place.eventDates.end).toLocaleDateString()}
//                       </span>
//                     ) : (
//                       <span>Visit: {new Date(pass.visitDate).toLocaleDateString()}</span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
//               <Ticket className="mx-auto text-gray-300 mb-4" size={48} />
//               <p className="text-gray-500 text-lg font-semibold">No active passes at the moment.</p>
//               <button
//                 onClick={() => navigate('/')}
//                 className="mt-4 text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 mx-auto"
//               >
//                 Browse Events <ArrowRight size={18} />
//               </button>
//             </div>
//           )}
//         </section>
//         )}

//         {/* Booking History Section */}
//         {activeTab === 'bookings' && (
//         <section className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
//               <Calendar className="text-indigo-600" size={28} />
//               Booking History
//             </h2>
//           </div>
          
//           {bookings.length > 0 ? (
//             <div className="space-y-4">
//               {bookings.map(booking => (
//                 <BookingCard key={booking._id} booking={booking} />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
//               <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
//               <p className="text-gray-500 text-lg font-semibold">No bookings yet.</p>
//               <button
//                 onClick={() => navigate('/')}
//                 className="mt-4 text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 mx-auto"
//               >
//                 Start Booking <ArrowRight size={18} />
//               </button>
//             </div>
//           )}
//         </section>
//         )}

//         {/* Hosted Events Section */}
//         {activeTab === 'hosted' && (user?.role === 'HOST' || user?.subscription?.isActive) && (
//           <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
//                 <TrendingUp className="text-purple-600" size={28} />
//                 My Hosted Events
//               </h2>
//               <button 
//                 onClick={() => navigate('/create-event')}
//                 className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
//               >
//                 <Plus size={20} /> Create Event
//               </button>
//             </div>
            
//             {events.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {events.map(event => (
//                   <div key={event._id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100 hover:shadow-lg transition-all">
//                     <h3 className="font-black text-xl text-gray-900 mb-3">
//                       {event.title || event.name}
//                     </h3>
//                     <div className="space-y-2 mb-4">
//                       <div className="flex items-center text-sm text-gray-600">
//                         <Users className="w-4 h-4 mr-2" />
//                         <span>Bookings: {event.bookings || 0}</span>
//                       </div>
//                       <div className="flex items-center text-sm text-gray-600">
//                         <Calendar className="w-4 h-4 mr-2" />
//                         <span>
//                           {new Date(event.date || event.eventDates?.start).toLocaleDateString()}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                         event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
//                         'bg-gray-100 text-gray-700'
//                       }`}>
//                         {event.status}
//                       </span>
//                       <button 
//                         onClick={() => navigate(`/manage-event/${event._id}`)}
//                         className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm"
//                       >
//                         Manage
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
//                 <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
//                 <p className="text-gray-500 text-lg font-semibold mb-4">No hosted events yet.</p>
//                 <button
//                   onClick={() => navigate('/create-event')}
//                   className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center gap-2 mx-auto"
//                 >
//                   <Plus size={20} /> Create Your First Event
//                 </button>
//               </div>
//             )}
//           </section>
//         )}
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon, title, value, color }) => (
//   <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
//     <div className="flex items-center justify-between mb-4">
//       <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
//         {icon}
//       </div>
//     </div>
//     <p className="text-4xl font-black mb-1">{value}</p>
//     <p className="text-white/90 font-semibold text-sm">{title}</p>
//   </div>
// );

// export default Dashboard;



import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import BookingCard from '../../components/visitor/BookingCard';
import { Calendar, Users, Ticket, Plus, TrendingUp, Clock, CheckCircle, ArrowRight, UserCircle2, Settings, Zap, MapPin, Activity, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [passes, setPasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [securityAssignments, setSecurityAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePasses: 0,
    totalBookings: 0,
    hostedEvents: 0
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [passesRes, bookingsRes, eventsRes, securityRes] = await Promise.all([
          api.get('/passes/my-passes'),
          api.get('/passes/bookings'),
          (user?.role === 'HOST' || user?.subscription?.isActive) ? api.get('/host/events') : Promise.resolve(null),
          api.get('/security/my-assignments').catch(() => null)
        ]);

        if (passesRes?.data?.success) {
          const allPasses = passesRes.data.passes || [];
          setPasses(allPasses);
          const active = allPasses.filter(p => p.status === 'APPROVED');
          setStats(prev => ({ ...prev, activePasses: active.length }));
        }

        if (bookingsRes?.data?.success) {
          const allBookings = bookingsRes.data.bookings || [];
          setBookings(allBookings);
          setStats(prev => ({ ...prev, totalBookings: allBookings.length }));
        }

        if (eventsRes?.data?.success) {
          const hostedEvents = eventsRes.data.events || [];
          setEvents(hostedEvents);
          setStats(prev => ({ ...prev, hostedEvents: hostedEvents.length }));
        }

        if (securityRes?.data?.success) {
          setSecurityAssignments(securityRes.data.assignments || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 md:px-8">
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] bg-cyan-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-[30vw] h-[30vw] bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* --- TOP PROFILE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-2xl blur opacity-30"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 size={36} className="text-slate-600" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white italic">
                {user?.name || 'Explorer'}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  <ShieldCheck size={12} /> {user?.role || 'User'}
                </span>
                <span className="text-slate-500 text-xs font-medium">Session Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => navigate('/profile')} className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white transition-all shadow-xl">
              <Settings size={20} />
            </button>
            {(user?.role === 'HOST' || user?.subscription?.isActive) && (
              <button onClick={() => navigate('/create-event')} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Plus size={18} /> Create Event
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR STATS & NAV --- */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex flex-col gap-1">
              {['overview', 'passes', 'bookings', 'hosted', 'security'].map((tab) => {
                if (tab === 'hosted' && !(user?.role === 'HOST' || user?.subscription?.isActive)) return null;
                if (tab === 'security' && securityAssignments.length === 0) return null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800/50'
                    }`}
                  >
                    {tab}
                    <ArrowRight size={14} className={activeTab === tab ? 'opacity-100' : 'opacity-0'} />
                  </button>
                )
              })}
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-transparent border border-slate-800 p-6 rounded-[2rem] space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Activity Analytics</p>
              <MiniStat label="Digital Passes" value={stats.activePasses} icon={<Ticket size={16}/>} color="text-cyan-400" />
              <MiniStat label="Event History" value={stats.totalBookings} icon={<Calendar size={16}/>} color="text-indigo-400" />
              {(user?.role === 'HOST' || user?.subscription?.isActive) && (
                <MiniStat label="Hosted Hubs" value={stats.hostedEvents} icon={<TrendingUp size={16}/>} color="text-emerald-400" />
              )}
              {securityAssignments.length > 0 && (
                <MiniStat label="Security Assignments" value={securityAssignments.length} icon={<ShieldCheck size={16}/>} color="text-cyan-400" />
              )}
            </div>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-9">
            
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
                  <Activity className="mx-auto text-cyan-500/20 mb-6 animate-pulse" size={64} />
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Centralized Command</h2>
                  <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mb-8 font-medium">
                    Welcome to your PassHub terminal. From here you can manage your entry permits, track event bookings, and monitor your hosted venues.
                  </p>
                  <button onClick={() => setActiveTab('passes')} className="px-8 py-3 rounded-full border border-slate-700 hover:border-cyan-500 text-xs font-black uppercase tracking-widest transition-all">
                    View Recent Passes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'passes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                {passes.length > 0 ? passes.map(pass => (
                  <div key={pass._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex gap-6 hover:border-slate-500 transition-all">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white rounded-2xl shadow-xl w-28 h-28 group-hover:scale-105 transition-transform">
                        <img src={pass.qrImage} alt="QR" className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {pass.status}
                        </span>
                        <Ticket size={16} className="text-slate-700" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 truncate">{pass.place?.name}</h3>
                      <p className="text-xs text-slate-500 font-bold mb-3 italic">ID: {pass.guest?.name}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <Clock size={12} className="text-cyan-500" />
                          {new Date(pass.visitDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                          <MapPin size={12} className="text-cyan-500" />
                          {pass.place?.location || 'Venue Hub'}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <EmptyState icon={<Ticket/>} text="No Active Entry Permits" />}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length > 0 ? bookings.map(booking => (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-2 hover:bg-slate-900 transition-colors">
                    <BookingCard key={booking._id} booking={booking} />
                  </div>
                )) : <EmptyState icon={<Calendar/>} text="No Booking Records Found" />}
              </div>
            )}

            {activeTab === 'hosted' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {events.length > 0 ? events.map(event => (
                  <div key={event._id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative group overflow-hidden">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp size={120} />
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none pr-10">{event.title || event.name}</h3>
                      <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {event.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <DataPoint label="Total Bookings" value={event.bookings || 0} icon={<Users size={14}/>} />
                      <DataPoint label="Event Date" value={new Date(event.date || event.eventDates?.start).toLocaleDateString()} icon={<Calendar size={14}/>} />
                      <DataPoint label="Category" value={event.category || 'Event'} icon={<Activity size={14}/>} />
                      <DataPoint label="Access Type" value={event.ticketAccessMode?.replace('_', ' ') || 'STANDARD'} icon={<ShieldCheck size={14}/>} />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => navigate(`/manage-event/${event._id}`)} className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all">
                        Manage Assets
                      </button>
                      <button className="px-5 py-4 bg-slate-800 rounded-2xl text-white hover:bg-slate-700 transition-all">
                        <TrendingUp size={18} />
                      </button>
                    </div>
                  </div>
                )) : <EmptyState icon={<TrendingUp/>} text="No Hosted Hubs Active" />}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {securityAssignments.length > 0 ? securityAssignments.map((assignment) => (
                  <div key={assignment._id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xl font-black text-white mb-2">{assignment.place?.name || 'Assigned Event'}</h3>
                    <p className="text-slate-400 text-sm mb-4">{assignment.place?.location || 'Location unavailable'}</p>
                    <p className="text-xs text-slate-500 mb-6">
                      {new Date(assignment.startsAt).toLocaleDateString()} - {new Date(assignment.expiresAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/security/scanner/${assignment.place?._id}`)}
                        className="flex-1 py-3 bg-cyan-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all"
                      >
                        Scan Passes
                      </button>
                      <button
                        onClick={() => navigate(`/security/dashboard/${assignment.place?._id}`)}
                        className="flex-1 py-3 bg-slate-800 text-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
                      >
                        Open Security Panel
                      </button>
                    </div>
                  </div>
                )) : <EmptyState icon={<ShieldCheck/>} text="No Security Assignments" />}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SMALL COMPONENTS --- */

const MiniStat = ({ label, value, icon, color }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-800 ${color}`}>{icon}</div>
      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
    </div>
    <span className="text-lg font-black text-white italic">{value}</span>
  </div>
);

const DataPoint = ({ label, value, icon }) => (
  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
    <div className="flex items-center gap-2 text-slate-500 mb-1.5">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-black text-slate-200 uppercase tracking-tight truncate">{value}</p>
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] text-center w-full">
    <div className="text-slate-800 mb-4 flex justify-center">
      {React.cloneElement(icon, { size: 48 })}
    </div>
    <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">{text}</p>
  </div>
);

export default Dashboard;