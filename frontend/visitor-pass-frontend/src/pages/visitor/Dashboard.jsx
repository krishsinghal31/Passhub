import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import BookingCard from '../../components/visitor/BookingCard';
import { Calendar, Users, Ticket, Plus, TrendingUp, Clock, CheckCircle, ArrowRight, UserCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [passes, setPasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePasses: 0,
    totalBookings: 0,
    hostedEvents: 0
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview | passes | bookings | hosted | profile

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Faster: run requests in parallel
        const [passesRes, bookingsRes, eventsRes] = await Promise.all([
          api.get('/passes/my-passes'),
          api.get('/passes/bookings'),
          (user?.role === 'HOST' || user?.subscription?.isActive) ? api.get('/host/events') : Promise.resolve(null)
        ]);

        if (passesRes?.data?.success) {
          const allPasses = passesRes.data.passes || [];
          setPasses(allPasses);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const active = allPasses.filter((p) => {
            if (p.status !== 'APPROVED') return false;
            if (p.ticketAccessMode === 'ALL_DAYS') {
              const end = p.place?.eventDates?.end;
              if (!end) return true;
              const endDate = new Date(end);
              endDate.setHours(0, 0, 0, 0);
              return endDate >= today;
            }
            if (!p.visitDate) return true;
            const v = new Date(p.visitDate);
            v.setHours(0, 0, 0, 0);
            return v >= today;
          });
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
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 size={26} className="text-indigo-600" />
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                {user?.name ? `@${user.name.split(' ')[0]}` : 'Dashboard'}
              </h1>
              <p className="text-gray-600 text-lg">
                Your PassHub profile & activity
                {user?.role && (
                  <span className="ml-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-black text-slate-600 uppercase tracking-widest">
                    {user.role}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2"
            >
              <UserCircle2 size={18} /> Profile
            </button>
            {(user?.role === 'HOST' || user?.subscription?.isActive) && (
              <button
                onClick={() => navigate('/create-event')}
                className="px-5 py-3 rounded-2xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all font-black flex items-center gap-2"
              >
                <Plus size={18} /> Create
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl p-3 shadow-xl border border-slate-100 mb-8 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'passes', label: 'Passes' },
            { id: 'bookings', label: 'Bookings' },
            ...(user?.role === 'HOST' || user?.subscription?.isActive ? [{ id: 'hosted', label: 'Hosted' }] : [])
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            icon={<Ticket className="text-indigo-600" size={24} />}
            title="Active Passes"
            value={stats.activePasses}
            color="from-indigo-500 to-indigo-600"
          />
          <StatCard 
            icon={<Calendar className="text-green-600" size={24} />}
            title="Total Bookings"
            value={stats.totalBookings}
            color="from-green-500 to-green-600"
          />
          {(user?.role === 'HOST' || user?.subscription?.isActive) && (
            <StatCard 
              icon={<TrendingUp className="text-purple-600" size={24} />}
              title="Hosted Events"
              value={stats.hostedEvents}
              color="from-purple-500 to-purple-600"
            />
          )}
        </div>
        )}

        {/* Active Passes Section */}
        {activeTab === 'passes' && (
        <section className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <CheckCircle className="text-green-500" size={28} />
              My Active Passes
            </h2>
            {passes.length > 0 && (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                {passes.length} Active
              </span>
            )}
          </div>
          
          {passes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {passes.map(pass => (
                <div key={pass._id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-100 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-base text-gray-900 mb-1">
                        {pass.place?.name || 'Event'}
                      </h3>
                      <p className="text-sm text-gray-600">Guest: {pass.guest?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pass.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      pass.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      pass.status === 'EXPIRED' ? 'bg-slate-200 text-slate-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {pass.status}
                    </span>
                  </div>
                  
                  {pass.qrImage && (
                    <div className="mb-3 p-3 bg-white rounded-xl border-2 border-indigo-200">
                      <img 
                        src={pass.qrImage} 
                        alt="QR Code" 
                        className="w-full h-auto rounded-lg max-h-40 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    {pass.ticketAccessMode === 'ALL_DAYS' && pass.place?.eventDates?.start && pass.place?.eventDates?.end ? (
                      <span>
                        Valid:{' '}
                        {new Date(pass.place.eventDates.start).toLocaleDateString()} -{' '}
                        {new Date(pass.place.eventDates.end).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>Visit: {new Date(pass.visitDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Ticket className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg font-semibold">No active passes at the moment.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 mx-auto"
              >
                Browse Events <ArrowRight size={18} />
              </button>
            </div>
          )}
        </section>
        )}

        {/* Booking History Section */}
        {activeTab === 'bookings' && (
        <section className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Calendar className="text-indigo-600" size={28} />
              Booking History
            </h2>
          </div>
          
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg font-semibold">No bookings yet.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 mx-auto"
              >
                Start Booking <ArrowRight size={18} />
              </button>
            </div>
          )}
        </section>
        )}

        {/* Hosted Events Section */}
        {activeTab === 'hosted' && (user?.role === 'HOST' || user?.subscription?.isActive) && (
          <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <TrendingUp className="text-purple-600" size={28} />
                My Hosted Events
              </h2>
              <button 
                onClick={() => navigate('/create-event')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Plus size={20} /> Create Event
              </button>
            </div>
            
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div key={event._id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100 hover:shadow-lg transition-all">
                    <h3 className="font-black text-xl text-gray-900 mb-3">
                      {event.title || event.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Bookings: {event.bookings || 0}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(event.date || event.eventDates?.start).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.status}
                      </span>
                      <button 
                        onClick={() => navigate(`/manage-event/${event._id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
                <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 text-lg font-semibold mb-4">No hosted events yet.</p>
                <button
                  onClick={() => navigate('/create-event')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} /> Create Your First Event
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
        {icon}
      </div>
    </div>
    <p className="text-4xl font-black mb-1">{value}</p>
    <p className="text-white/90 font-semibold text-sm">{title}</p>
  </div>
);

export default Dashboard;
