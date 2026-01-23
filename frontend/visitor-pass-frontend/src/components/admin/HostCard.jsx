// src/components/admin/HostCard.jsx
import React from 'react';
import { User, Calendar, TrendingUp, Activity } from 'lucide-react';

const HostCard = ({ host }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const daysRemaining = host.subscription?.daysRemaining || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-800">{host.name}</h4>
          <p className="text-sm text-gray-600">{host.email}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Joined</span>
          <span className="font-medium text-gray-800">{formatDate(host.createdAt)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Events</span>
          <span className="font-bold text-indigo-600">{host.eventsCount || 0}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Active Events</span>
          <span className="font-bold text-green-600">{host.activeEvents || 0}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Revenue</span>
          <span className="font-bold text-purple-600">₹{host.totalRevenue || 0}</span>
        </div>
      </div>

      {host.subscription?.isActive && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Active Subscription</span>
          </div>
          <p className="text-xs text-green-600">
            {host.subscription.planId?.name || 'Active Plan'} - {daysRemaining} days left
          </p>
        </div>
      )}

      <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
        host.isActive 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {host.isActive ? 'Active' : 'Disabled'}
      </div>
    </div>
  );
};

export default HostCard;