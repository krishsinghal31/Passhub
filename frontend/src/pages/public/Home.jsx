import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import EventCard from '../../components/common/EventCard';
import { Search, Calendar, Shield, Users, ArrowRight, CheckCircle, Sparkles, TrendingUp, X, Zap, Globe, Cpu, Ticket, Rocket, Layers } from 'lucide-react';

const Home = ({ setShowAuthModal }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/public/home-events');
        if (res.data.success) {
          setEvents(res.data.upcomingEvents || []);
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

  const query = searchQuery.trim().toLowerCase();
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const isSearching = query.length > 0;

  const searchPool = useMemo(() => {
    const all = [...(events || []), ...(popularEvents || [])];
    const seen = new Set();
    return all.filter((e) => {
      const id = e?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [events, popularEvents]);

  const filteredEvents = useMemo(() => {
    if (!isSearching) return events || [];
    return searchPool.filter((event) => {
      const searchable = [
        event.title,
        event.name,
        event.description,
        event.place?.name,
        event.place?.city,
        event.location,
        event.category
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Every typed word must match somewhere in searchable text.
      return queryTokens.every((token) => searchable.includes(token));
    });
  }, [events, isSearching, queryTokens, searchPool]);

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else setShowAuthModal && setShowAuthModal(true);
  };

  const handleHostEvent = () => {
    if (user) navigate('/create-event'); // Adjust path based on your routes
    else setShowAuthModal && setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* --- HYPER HERO SECTION --- */}
      <div className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Adjusted Gradient for Slate Palette */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-xl mb-6 shadow-xl">
            <Sparkles className="text-cyan-400" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">The Ultimate Entry Protocol</span>
          </div>

          <h1 className="text-[12vw] md:text-[8rem] font-black leading-[0.85] tracking-tighter mb-8 uppercase text-white">
            Pass<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Hub</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
             Revolutionizing access for the next generation of experiences. 
             Secure, lightning-fast, and entirely digital.
          </p>

          {/* Modern Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-2xl p-2 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-2 shadow-2xl">
              <div className="flex-1 flex items-center px-4">
                <Search className="text-slate-500 mr-3" size={20} />
                <input
                  type="text"
                  placeholder="Find your next vibe..."
                  className="w-full py-4 bg-transparent focus:outline-none text-white placeholder:text-slate-600 font-semibold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={handleGetStarted} className="bg-cyan-500 text-slate-950 px-8 py-4 rounded-xl font-black hover:bg-white hover:text-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                {user ? 'DASHBOARD' : 'GET STARTED'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- BENTO STATS SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[2.5rem] border border-slate-700 flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
                <Layers className="absolute right-[-20px] bottom-[-20px] size-40 text-cyan-500/5 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-4xl font-black leading-none text-white">Scale Your<br/>Events</h3>
                <p className="text-slate-400 font-bold tracking-widest mt-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-cyan-400" /> PRO-GRADE INFRASTRUCTURE
                </p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center backdrop-blur-sm">
                <span className="text-5xl font-black mb-2 tracking-tighter text-white">99.9%</span>
                <p className="text-slate-500 uppercase text-xs font-bold tracking-[0.2em]">Uptime</p>
            </div>
            <div className="bg-cyan-500 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-lg shadow-cyan-500/20">
                <span className="text-5xl font-black mb-2 tracking-tighter text-slate-950">24/7</span>
                <p className="text-slate-900/70 uppercase text-xs font-bold tracking-[0.2em]">Gate Support</p>
            </div>
        </div>
      </section>

      {/* --- TRENDING SECTION --- */}
      {!isSearching && popularEvents.length > 0 && (
        <section className="py-20 bg-slate-900/50 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
                    <TrendingUp className="text-cyan-400" /> Popular Drops
                </h2>
                <div className="h-px flex-1 bg-slate-800 mx-8 hidden md:block"></div>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-10 snap-x no-scrollbar">
              {popularEvents.map(event => (
                <div key={event._id} className="w-[380px] flex-shrink-0 snap-center">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- MAIN GRID SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4 text-white">
              {isSearching ? 'Results' : 'Explore All'}
            </h2>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                LIVE DATABASE ACCESS
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 bg-slate-800/50 border border-slate-700 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredEvents.map(event => (
                <div key={event._id} className="group hover:translate-y-[-10px] transition-all duration-500">
                    <EventCard event={event} />
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-slate-800 rounded-[3rem]">
            <Zap className="mx-auto text-slate-700 mb-6" size={60} />
            <p className="text-slate-500 text-2xl font-black uppercase">No Events Found</p>
          </div>
        )}
      </section>

      {/* --- HOW IT WORKS: SLATE THEME --- */}
      <section className="bg-slate-900 py-32 relative overflow-hidden border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-white uppercase tracking-tighter">The System</h2>
            <p className="text-cyan-500 font-bold uppercase tracking-widest text-sm mt-4">Simple. Fast. Secure.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard number="01" title="Identity" desc="Create your profile in seconds." icon={<Users/>} />
            <StepCard number="02" title="Discover" desc="Find events that match your vibe." icon={<Search/>} />
            <StepCard number="03" title="Secure" desc="Instant digital pass generation." icon={<Ticket/>} />
            <StepCard number="04" title="Entry" desc="Scan your QR and dive in." icon={<Shield/>} />
          </div>
        </div>
      </section>

      {/* --- HOST AN EVENT CTA (UPDATED) --- */}
      <section className="max-w-7xl mx-auto px-6 py-40 text-center">
        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-12 md:p-24 rounded-[4rem] relative overflow-hidden shadow-2xl shadow-cyan-500/10 group">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-500">
                    <Rocket className="text-white" size={40} />
                </div>
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 text-white">
                    Become an <br/>Organizer.
                </h2>
                <p className="text-cyan-50 mb-12 max-w-xl mx-auto text-lg font-medium">
                    Whether it's a small meetup or a massive concert, PassHub gives you the tools to manage entries and sales like a pro.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <button 
                        onClick={handleHostEvent}
                        className="bg-white text-blue-700 px-12 py-5 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        CREATE YOUR EVENT <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER BRANDS --- */}
      <div className="pb-20 opacity-20 grayscale flex flex-wrap justify-center gap-12 px-6">
        <span className="font-black text-2xl tracking-tighter uppercase text-slate-400 italic">Trusted by creators worldwide</span>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, desc, icon }) => (
  <div className="bg-slate-800/50 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-700 hover:border-cyan-500/50 transition-all group">
    <div className="text-cyan-400 mb-6 transform group-hover:scale-110 transition-transform duration-500">
        {React.cloneElement(icon, { size: 36 })}
    </div>
    <span className="text-xs font-mono text-slate-500 mb-2 block tracking-widest">{number} //</span>
    <h3 className="text-2xl font-black text-white uppercase mb-4">{title}</h3>
    <p className="text-slate-400 text-sm font-medium leading-relaxed">{desc}</p>
  </div>
);

export default Home;