// src/pages/security/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Shield, LogOut, Key, Activity } from 'lucide-react';

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const securityEmail = localStorage.getItem('securityEmail');

  useEffect(() => {
    // Check if security is logged in
    const securityToken = localStorage.getItem('securityToken');
    if (!securityToken) {
      navigate('/');
      return;
    }

    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/security/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      alert('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('securityToken');
    localStorage.removeItem('securityId');
    localStorage.removeItem('securityEmail');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Security Dashboard</h1>
                <p className="text-gray-600">{securityEmail}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/security/change-password')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Key className="w-5 h-5" />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Scans Today</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalScans || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Valid Scans</p>
                  <p className="text-3xl font-bold text-green-600">{stats.validScans || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Invalid Scans</p>
                  <p className="text-3xl font-bold text-red-600">{stats.invalidScans || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Scan Visitor Pass</h2>
          {/* Add QR Scanner component here */}
          <p className="text-gray-600">QR Scanner will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;