import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import EventCard from '../../components/common/EventCard';

const Home = ({ setShowAuthModal }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/public/home-events');
        if (res.data.success) {
          setEvents(res.data.upcomingEvents || []);
          setFeaturedEvents(res.data.featuredEvents || []);
          setPopularEvents(res.data.popularEvents || []);
          setFilteredEvents(res.data.upcomingEvents || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Full-Screen Hero Section */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in tracking-tight drop-shadow-lg">
            Welcome to PassHub
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 mb-8 leading-relaxed drop-shadow-md">
            Your ultimate Visitor Pass Management System. Discover events, manage passes, and connect seamlessly.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-10 py-4 rounded-full font-semibold text-lg hover:bg-indigo-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            {user ? 'My Dashboard' : 'Get Started'}
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20 -mt-16 relative z-20">
        {/* Horizontal Scroll Section - NEW */}
        {popularEvents.length > 0 && (
          <section className="bg-white rounded-xl shadow-2xl p-10 animate-fade-in border border-gray-100 transform hover:scale-102 transition-transform">
            <h2 className="text-4xl font-bold mb-8 text-gray-800 text-center border-b-4 border-indigo-300 pb-4">
              Popular Events
            </h2>
            <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-6 pb-4" style={{ height: '320px' }}>
              {popularEvents.map(event => (
                <div key={event._id} className="flex-shrink-0 w-80 snap-center transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl rounded-lg overflow-hidden">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search Bar - NEW */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search events by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Events Grid - RESTORED */}
        <section className="bg-white rounded-xl shadow-2xl p-10 animate-fade-in border border-gray-100 transform hover:scale-102 transition-transform">
          <h2 className="text-4xl font-bold mb-8 text-gray-800 text-center border-b-4 border-indigo-300 pb-4">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div key={event._id} className="transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl rounded-lg overflow-hidden">
                  <EventCard event={event} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center flex items-center justify-center w-full h-full text-lg col-span-full">
                No events found matching your search.
              </p>
            )}
          </div>
        </section>

        {/* How to Use Section */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-2xl p-10 animate-fade-in border border-gray-100 transform hover:scale-102 transition-transform">
          <h2 className="text-4xl font-bold mb-10 text-gray-800 text-center">How to Use PassHub</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <article className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 transform hover:scale-105">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Step 1: Register</h3>
              <p className="text-gray-600 leading-relaxed">Create your account to get started with managing visitor passes.</p>
            </article>
            <article className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 transform hover:scale-105">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Step 2: Browse Events</h3>
              <p className="text-gray-600 leading-relaxed">Explore featured, popular, and upcoming events tailored to you.</p>
            </article>
            <article className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 transform hover:scale-105">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Step 3: Book Passes</h3>
              <p className="text-gray-600 leading-relaxed">Select events and generate secure visitor passes instantly.</p>
            </article>
            <article className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 transform hover:scale-105">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Step 4: Enjoy Secure Access</h3>
              <p className="text-gray-600 leading-relaxed">Use your pass for seamless entry and track your visits.</p>
            </article>
          </div>
        </section>

        {/* About Us Section */}
        <section className="bg-white rounded-xl shadow-2xl p-10 animate-fade-in border border-gray-100 transform hover:scale-102 transition-transform">
          <h2 className="text-4xl font-bold mb-10 text-gray-800 text-center">About Us</h2>
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <p className="text-xl text-gray-700 leading-relaxed">
              PassHub is a cutting-edge Visitor Pass Management System designed to simplify event access and visitor tracking.
              Whether you're organizing corporate events, conferences, or public gatherings, our platform ensures secure,
              efficient, and user-friendly pass generation and management.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              Built with modern technology, PassHub integrates seamlessly with your existing systems, providing real-time
              analytics, customizable passes, and a hassle-free experience for both organizers and visitors.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              Join thousands of users who trust PassHub for reliable, innovative solutions. Let's make every visit memorable!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;