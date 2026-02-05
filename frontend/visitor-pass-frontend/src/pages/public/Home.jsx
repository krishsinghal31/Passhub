import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import EventCard from '../../components/common/EventCard';
import { Search, MapPin, Calendar, Star, Shield, Users, Clock, ArrowRight, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

const Home = ({ setShowAuthModal }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/public/home-events');
        if (res.data.success) {
          setEvents(res.data.upcomingEvents || []);
          setFeaturedEvents(res.data.featuredEvents || []);
          setPopularEvents(res.data.popularEvents || []);
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const filteredEvents = events.filter(event => 
    (event.title || event.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.place?.city || event.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else setShowAuthModal && setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto py-20">
          <div className="mb-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
              <Sparkles className="text-yellow-300" size={20} />
              <span className="text-white font-semibold text-sm">Digital Pass Management</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight">
            Welcome to <span className="text-indigo-200">PassHub</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Seamless digital entry management for the world's most exciting events. Book passes, manage access, and enjoy hassle-free experiences.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 max-w-3xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
              <Search className="text-gray-400 mr-3" size={24} />
              <input 
                type="text" 
                placeholder="Search events, cities, or venues..." 
                className="w-full p-3 focus:outline-none text-gray-800 text-lg bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={handleGetStarted}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowRight className="text-white/60 rotate-90" size={24} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-24 pb-24 -mt-16 relative z-20">
        {/* Popular Events Horizontal Scroll */}
        {popularEvents.length > 0 && (
          <section className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <TrendingUp className="text-amber-600" size={24} />
              </div>
              <h2 className="text-3xl font-black text-gray-800">Popular Right Now</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth">
              {popularEvents.map(event => (
                <div key={event._id} className="w-80 flex-shrink-0 snap-center">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events Grid */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <Calendar className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Upcoming Events</h2>
            </div>
            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
              {filteredEvents.length} Events Available
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No events found matching your search.</p>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 md:p-20 text-white shadow-2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-indigo-100 text-lg md:text-xl">Four simple steps to seamless event access</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              icon={<Users className="text-indigo-600" size={32} />} 
              title="1. Create Account" 
              desc="Sign up in seconds with your email" 
              number="01"
            />
            <StepCard 
              icon={<Search className="text-indigo-600" size={32} />} 
              title="2. Browse Events" 
              desc="Discover amazing events near you" 
              number="02"
            />
            <StepCard 
              icon={<CheckCircle className="text-indigo-600" size={32} />} 
              title="3. Book Passes" 
              desc="Secure your spot instantly" 
              number="03"
            />
            <StepCard 
              icon={<Shield className="text-indigo-600" size={32} />} 
              title="4. Enter Seamlessly" 
              desc="QR code scanning at the gate" 
              number="04"
            />
          </div>
        </section>

        {/* About Us */}
        <section className="grid md:grid-cols-2 gap-16 items-center bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-4xl font-black text-gray-900">About PassHub</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              PassHub is a cutting-edge digital ticketing and visitor pass management system designed to revolutionize event access. 
              We eliminate paper waste, reduce queues, and provide real-time analytics for event organizers.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Built with modern technology, PassHub ensures secure, efficient, and user-friendly pass generation. 
              Whether you're organizing corporate events, conferences, or public gatherings, our platform delivers seamless experiences.
            </p>
            <button 
              onClick={handleGetStarted}
              className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all group"
            >
              Start hosting today <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 h-96 rounded-3xl flex items-center justify-center border-4 border-white shadow-inner overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&w=800&q=80" 
              className="rounded-2xl w-full h-full object-cover" 
              alt="Team" 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const StepCard = ({ icon, title, desc, number }) => (
  <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20">
    <div className="flex items-start justify-between mb-6">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
        {icon}
      </div>
      <span className="text-6xl font-black text-white/20">{number}</span>
    </div>
    <h3 className="text-xl font-black mb-3">{title}</h3>
    <p className="text-indigo-100/80 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Home;
