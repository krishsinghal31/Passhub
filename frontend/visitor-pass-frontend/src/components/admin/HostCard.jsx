// // src/components/admin/HostCard.jsx
// import React from 'react';
// import { User, Calendar, TrendingUp, Activity } from 'lucide-react';

// const HostCard = ({ host }) => {
//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     return new Date(dateStr).toLocaleDateString('en-US', { 
//       month: 'short', day: 'numeric', year: 'numeric' 
//     });
//   };

//   const daysRemaining = host.subscription?.daysRemaining || 0;

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
//       <div className="flex items-center gap-4 mb-4">
//         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//           <User className="w-7 h-7 text-white" />
//         </div>
//         <div className="flex-1">
//           <h4 className="font-bold text-lg text-gray-800">{host.name}</h4>
//           <p className="text-sm text-gray-600">{host.email}</p>
//         </div>
//       </div>

//       <div className="space-y-3 mb-4">
//         <div className="flex justify-between items-center text-sm">
//           <span className="text-gray-600">Joined</span>
//           <span className="font-medium text-gray-800">{formatDate(host.createdAt)}</span>
//         </div>

//         <div className="flex justify-between items-center text-sm">
//           <span className="text-gray-600">Total Events</span>
//           <span className="font-bold text-indigo-600">{host.eventsCount || 0}</span>
//         </div>

//         <div className="flex justify-between items-center text-sm">
//           <span className="text-gray-600">Active Events</span>
//           <span className="font-bold text-green-600">{host.activeEvents || 0}</span>
//         </div>

//         <div className="flex justify-between items-center text-sm">
//           <span className="text-gray-600">Revenue</span>
//           <span className="font-bold text-purple-600">₹{host.totalRevenue || 0}</span>
//         </div>
//       </div>

//       {host.subscription?.isActive && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
//           <div className="flex items-center gap-2 mb-1">
//             <Activity className="w-4 h-4 text-green-600" />
//             <span className="text-sm font-semibold text-green-700">Active Subscription</span>
//           </div>
//           <p className="text-xs text-green-600">
//             {host.subscription.planId?.name || 'Active Plan'} - {daysRemaining} days left
//           </p>
//         </div>
//       )}

//       <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
//         host.isActive 
//           ? 'bg-green-100 text-green-700' 
//           : 'bg-red-100 text-red-700'
//       }`}>
//         {host.isActive ? 'Active' : 'Disabled'}
//       </div>
//     </div>
//   );
// };

// export default HostCard;



// src/components/admin/HostCard.jsx
import React from 'react';
import { User, Calendar, TrendingUp, Activity, Globe, ShieldCheck } from 'lucide-react';

const HostCard = ({ host }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const daysRemaining = host.subscription?.daysRemaining || 0;

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-slate-800 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl">
      {/* Header: Profile Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
            <User className="w-7 h-7 text-slate-400 group-hover:text-cyan-400" />
          </div>
          {host.isActive && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="font-black text-white uppercase italic tracking-tighter truncate">{host.name}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{host.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Events</p>
          <p className="text-sm font-black text-white">{host.eventsCount || 0}</p>
        </div>
        <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Revenue</p>
          <p className="text-sm font-black text-cyan-400">₹{host.totalRevenue || 0}</p>
        </div>
      </div>

      {/* Subscription Status */}
      {host.subscription?.isActive ? (
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black text-cyan-500 uppercase">Pro Subscription</span>
            <ShieldCheck size={14} className="text-cyan-500" />
          </div>
          <p className="text-[11px] font-bold text-slate-300">
            {daysRemaining} Days Remaining
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 mb-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">No Active Plan</span>
        </div>
      )}

      {/* Footer Status */}
      <div className={`w-full py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-[0.2em] border ${
        host.isActive 
          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      }`}>
        {host.isActive ? 'System Active' : 'System Disabled'}
      </div>
    </div>
  );
};

export default HostCard;