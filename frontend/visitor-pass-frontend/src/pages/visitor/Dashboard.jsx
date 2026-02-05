import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import BookingCard from '../../components/visitor/BookingCard';
import { Calendar, Users, Ticket, Plus, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get active passes (upcoming/active passes)
        const passesRes = await api.get('/passes/my-passes');
        if (passesRes.data.success) {
          const activePasses = passesRes.data.passes || [];
          setPasses(activePasses);
          setStats(prev => ({ ...prev, activePasses: activePasses.length }));
        }

        // Get all bookings (complete history)
        const bookingsRes = await api.get('/passes/bookings');
        if (bookingsRes.data.success) {
          const allBookings = bookingsRes.data.bookings || [];
          setBookings(allBookings);
          setStats(prev => ({ ...prev, totalBookings: allBookings.length }));
        }

        // If user is a host with active subscription, get hosted events
        if (user?.role === 'HOST' || user?.subscription?.isActive) {
          const eventsRes = await api.get('/host/events');
          if (eventsRes.data.success) {
            const hostedEvents = eventsRes.data.events || [];
            setEvents(hostedEvents);
            setStats(prev => ({ ...prev, hostedEvents: hostedEvents.length }));
          }
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
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 text-lg">Manage your bookings and events from here</p>
        </div>

        {/* Stats Cards */}
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

        {/* Active Passes Section */}
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
                <div key={pass._id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-lg text-gray-900 mb-1">
                        {pass.place?.name || 'Event'}
                      </h3>
                      <p className="text-sm text-gray-600">Guest: {pass.guest?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pass.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      pass.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {pass.status}
                    </span>
                  </div>
                  
                  {pass.qrImage && (
                    <div className="mb-4 p-4 bg-white rounded-xl border-2 border-indigo-200">
                      <img 
                        src={pass.qrImage} 
                        alt="QR Code" 
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Visit: {new Date(pass.visitDate).toLocaleDateString()}</span>
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

        {/* Booking History Section */}
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

        {/* Hosted Events Section */}
        {(user?.role === 'HOST' || user?.subscription?.isActive) && (
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
                        onClick={() => navigate(`/places/${event._id}`)}
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
