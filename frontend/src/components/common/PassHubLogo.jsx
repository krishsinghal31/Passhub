import React from 'react';
import logo from '../../assets/logo.svg';

const PassHubLogo = ({ compact = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="PassHub logo"
        className={compact ? 'h-8 w-8 rounded-lg border border-slate-700 bg-slate-900 p-1' : 'h-10 w-10 rounded-xl border border-slate-700 bg-slate-900 p-1.5'}
      />
      <span className={`${compact ? 'text-lg' : 'text-2xl'} font-black tracking-tighter uppercase italic`}>
        Pass<span className="text-cyan-400">Hub</span>
      </span>
    </div>
  );
};

export default PassHubLogo;
