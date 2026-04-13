import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
    <div className="max-w-md">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl">
          <Ghost size={48} className="text-cyan-500" />
        </div>
      </div>
      <h1 className="text-6xl font-black text-white mb-2 tracking-tighter italic">404</h1>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">This page has vanished into the void</p>
      
      <Link to="/" className="inline-flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20">
        <Home size={18} /> Return Home
      </Link>
    </div>
  </div>
);

export default NotFound;