// src/components/common/Footer.jsx 
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const handleCall = () => {
    window.location.href = 'tel:+919351569865'; 
  };

  const handleEmail = () => {
    window.location.href = 'mailto:support@passhub.com';
  };

  const scrollToSection = (sectionId) => {
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              PassHub
            </h3>
            <p className="text-gray-400 mb-4">
              Your one-stop solution for seamless event management and pass booking.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('about-us')}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-to-use')}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  How to Use
                </button>
              </li>
              <li>
                <Link to="/subscriptions" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Subscriptions
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('events-section')}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Browse Events
                </button>
              </li>
            </ul>
          </div>

          {/* For Hosts */}
          <div>
            <h4 className="text-xl font-bold mb-4">For Hosts</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  View Plans
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Host Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <button
                onClick={handleCall}
                className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">Call Us</p>
                  <p className="text-sm font-semibold">+91 123-456-7890</p>
                </div>
              </button>

              <button
                onClick={handleEmail}
                className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">Email Us</p>
                  <p className="text-sm font-semibold">support@passhub.com</p>
                </div>
              </button>

              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-semibold">Dhanbad, Jharkhand, IN</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} PassHub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;