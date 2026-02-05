import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, LogOut, Shield, ChevronDown, X, LayoutDashboard, Settings, Menu } from 'lucide-react';
import logo from '../../assets/logo.png';

const Header = ({ setShowAuthModal }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [profilePicture, setProfilePicture] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const savedPic = localStorage.getItem(`profile_picture_${user.id}`);
      setProfilePicture(savedPic);
    }
  }, [user]);

  const isHomePage = location.pathname === '/';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <>
      <header className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 bg-indigo-600/95 backdrop-blur-md text-white shadow-lg transition-all`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={logo} alt="PassHub Logo" className="h-12 w-12 rounded-xl bg-white p-1.5 shadow-lg" />
            <span className="text-2xl font-black tracking-tight">Pass<span className="text-indigo-200">Hub</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2 items-center">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Home
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-4 py-2 rounded-lg font-semibold bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Shield size={16} /> Admin
                  </Link>
                )}
              </>
            )}
            
            {user ? (
              <div className="relative">
                <div 
                  className="flex items-center gap-2 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-white/10 transition-all"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        className="w-full h-full object-cover" 
                        alt="Profile"
                        onClick={(e) => { e.stopPropagation(); setShowFullImage(true); }}
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 border border-gray-100 text-gray-800 z-50">
                    <div className="px-6 py-4 border-b border-gray-50 mb-2">
                      <p className="font-black text-lg leading-tight">{user.name}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">{user.role}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      onClick={() => setShowDropdown(false)} 
                      className="flex items-center gap-4 px-6 py-3 hover:bg-indigo-50 transition-colors font-semibold"
                    >
                      <Settings size={20} className="text-gray-400" /> Account Settings
                    </Link>
                    <button 
                      onClick={() => { logout(); navigate('/'); setShowDropdown(false); }}
                      className="w-full flex items-center gap-4 px-6 py-3 hover:bg-red-50 text-red-600 transition-colors font-semibold border-t border-gray-50 mt-2"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal && setShowAuthModal(true)}
                className="px-8 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-black shadow-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20"
              >
                LOGIN
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-indigo-700/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                Home
              </Link>
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all"
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-red-500/20 text-red-200 transition-all"
                  >
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <button 
                  onClick={() => { setShowAuthModal && setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-2 rounded-lg font-semibold bg-white/20 hover:bg-white/30 transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Full Image Modal */}
      {showFullImage && profilePicture && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" 
          onClick={() => setShowFullImage(false)}
        >
          <button 
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
          <img 
            src={profilePicture} 
            className="max-w-full max-h-[85vh] rounded-3xl border-4 border-white/10 shadow-2xl" 
            alt="Profile" 
          />
        </div>
      )}
    </>
  );
};

export default Header;
