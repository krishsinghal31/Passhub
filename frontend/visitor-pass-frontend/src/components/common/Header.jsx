
// src/components/common/Header.jsx - FIXED VERSION
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import logo from '../../assets/logo.png';

const Header = ({ setShowAuthModal }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if header should be absolute (only on home page)
  const isHomePage = location.pathname === '/';
  const headerClasses = isHomePage 
    ? "absolute top-0 left-0 right-0 z-50 bg-black bg-opacity-30 backdrop-blur-md text-white shadow-lg"
    : "sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg";

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-300">
          <img src={logo} alt="PassHub" className="h-10 mr-3 rounded-full shadow-md" />
          <span className="text-2xl font-bold tracking-wide">PassHub</span>
        </Link>
        <nav className="flex gap-6 items-center">
          <Link
            to="/"
            className="text-white hover:text-indigo-200 transition-colors duration-300 font-medium"
          >
            Home
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="text-white hover:text-indigo-200 transition-colors duration-300 font-medium"
            >
              My Dashboard
            </Link>
          )}
          {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
            <Link
              to="/admin"
              className="text-white hover:text-indigo-200 transition-colors duration-300 font-medium"
            >
              Admin Panel
            </Link>
          ) : null}
          {user ? (
            <button
              onClick={() => { 
                logout(); 
                navigate('/'); 
              }}
              className="bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium shadow-md"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium shadow-md"
            >
              Login
            </button>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;