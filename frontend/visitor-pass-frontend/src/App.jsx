//src/App.jsx 
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/public/Home';
import AuthModal from './components/common/AuthModal';
import Auth from './pages/public/Auth';
import EventDetails from './pages/public/EventDetails';
import VisitorDashboard from './pages/visitor/Dashboard';
import BookEvent from './pages/visitor/BookEvent';
import CreateEvent from './pages/visitor/CreateEvent';
import ManageEvent from './pages/visitor/ManageEvent';
import BookingDetails from './pages/visitor/BookingDetails';
import AdminDashboard from './pages/admin/Dashboard';
//import SecurityLogin from './pages/security/Login';
import SecurityDashboard from './pages/security/Dashboard';
import SecurityChangePassword from './pages/security/ChangePassword';
import Subscriptions from './pages/shared/Subscriptions';
import Profile from './pages/shared/Profile';
import NotFound from './pages/shared/NotFound';
import AdminManageEvent from './pages/admin/ManageEvent';
import EditEvent from './pages/visitor/EditEvent';
import SecurityScanner from './pages/security/SecurityScanner';

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Header setShowAuthModal={setShowAuthModal} />
          <main className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home setShowAuthModal={setShowAuthModal} />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/places/:placeId" element={<EventDetails />} />
              
              {/* Visitor Routes */}
              <Route path="/dashboard" element={<VisitorDashboard />} />
              <Route path="/book/:placeId" element={<BookEvent />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/manage-event/:eventId" element={<ManageEvent />} />
              <Route path="/edit-event/:eventId" element={<EditEvent />} />
              <Route path="/booking/:bookingId" element={<BookingDetails />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/events/:eventId/manage" element={<AdminManageEvent />} />
              
              {/* Security Routes */}
              <Route path="/security/scanner/:placeId" element={<SecurityScanner />} />
              <Route path="/security/dashboard/:placeId" element={<SecurityDashboard />} />
              <Route path="/security/change-password" element={<SecurityChangePassword />} />
              
              {/* Shared Routes */}
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

