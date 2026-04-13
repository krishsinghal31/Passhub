// // src/components/common/Footer.jsx 
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

// const Footer = () => {
//   const navigate = useNavigate();

//   const handleCall = () => {
//     window.location.href = 'tel:+919351569865'; 
//   };

//   const handleEmail = () => {
//     window.location.href = 'mailto:support@passhub.com';
//   };

//   const scrollToSection = (sectionId) => {
//     // If not on home page, navigate to home first
//     if (window.location.pathname !== '/') {
//       navigate('/');
//       setTimeout(() => {
//         document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     } else {
//       document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
//       <div className="max-w-7xl mx-auto px-6 py-12">
//         <div className="grid md:grid-cols-4 gap-8">
//           {/* Brand Section */}
//           <div>
//             <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
//               PassHub
//             </h3>
//             <p className="text-gray-400 mb-4">
//               Your one-stop solution for seamless event management and pass booking.
//             </p>
//             <div className="flex gap-3">
//               <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
//                 <Facebook className="w-5 h-5" />
//               </a>
//               <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
//                 <Twitter className="w-5 h-5" />
//               </a>
//               <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
//                 <Instagram className="w-5 h-5" />
//               </a>
//               <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
//                 <Linkedin className="w-5 h-5" />
//               </a>
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h4 className="text-xl font-bold mb-4">Quick Links</h4>
//             <ul className="space-y-2">
//               <li>
//                 <button
//                   onClick={() => scrollToSection('about-us')}
//                   className="text-gray-400 hover:text-indigo-400 transition-colors"
//                 >
//                   About Us
//                 </button>
//               </li>
//               <li>
//                 <button
//                   onClick={() => scrollToSection('how-to-use')}
//                   className="text-gray-400 hover:text-indigo-400 transition-colors"
//                 >
//                   How to Use
//                 </button>
//               </li>
//               <li>
//                 <Link to="/subscriptions" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   Subscriptions
//                 </Link>
//               </li>
//               <li>
//                 <button
//                   onClick={() => scrollToSection('events-section')}
//                   className="text-gray-400 hover:text-indigo-400 transition-colors"
//                 >
//                   Browse Events
//                 </button>
//               </li>
//             </ul>
//           </div>

//           {/* For Hosts */}
//           <div>
//             <h4 className="text-xl font-bold mb-4">For Hosts</h4>
//             <ul className="space-y-2">
//               <li>
//                 <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   Host Dashboard
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/create-event" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   Create Event
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/subscriptions" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   View Plans
//                 </Link>
//               </li>
//               <li>
//                 <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   Host Guide
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Contact */}
//           <div>
//             <h4 className="text-xl font-bold mb-4">Contact Us</h4>
//             <div className="space-y-3">
//               <button
//                 onClick={handleCall}
//                 className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
//               >
//                 <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
//                   <Phone className="w-5 h-5" />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-xs text-gray-500">Call Us</p>
//                   <p className="text-sm font-semibold">+91 123-456-7890</p>
//                 </div>
//               </button>

//               <button
//                 onClick={handleEmail}
//                 className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors group"
//               >
//                 <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
//                   <Mail className="w-5 h-5" />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-xs text-gray-500">Email Us</p>
//                   <p className="text-sm font-semibold">support@passhub.com</p>
//                 </div>
//               </button>

//               <div className="flex items-center gap-3 text-gray-400">
//                 <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
//                   <MapPin className="w-5 h-5" />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-xs text-gray-500">Location</p>
//                   <p className="text-sm font-semibold">Dhanbad, Jharkhand, IN</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="mt-12 pt-8 border-t border-gray-800">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <p className="text-gray-400 text-sm">
//               &copy; {new Date().getFullYear()} PassHub. All rights reserved.
//             </p>
//             <div className="flex gap-6 text-sm">
//               <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                 Privacy Policy
//               </a>
//               <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                 Terms of Service
//               </a>
//               <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
//                 Cookie Policy
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;




// src/components/common/Footer.jsx 
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import PassHubLogo from './PassHubLogo';

const Footer = () => {
  const navigate = useNavigate();

  const handleCall = () => { window.location.href = 'tel:+919351569865'; };
  const handleEmail = () => { window.location.href = 'mailto:support@passhub.com'; };

  const scrollToSection = (sectionId) => {
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
    <footer className="bg-[#0f172a] text-slate-100 border-t border-slate-800/50 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-8">
            <PassHubLogo className="text-white" />
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
              The ultimate entry protocol for the next generation of experiences. 
              Built for speed, secured by code.
            </p>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 max-w-md">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">Subscription Gateway</p>
              <div className="flex flex-wrap gap-3 mb-3 text-xs font-semibold text-slate-200">
                <span className="inline-flex items-center gap-1.5"><CreditCard size={14} /> Razorpay</span>
                <span className="inline-flex items-center gap-1.5"><Landmark size={14} /> Stripe</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300"><ShieldCheck size={14} /> Secure</span>
              </div>
              <Link to="/subscriptions" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-400 transition-colors">
                Purchase Subscription <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-300 group">
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/80">Navigation //</h4>
            <ul className="space-y-4">
              {['About Us', 'How to Use', 'Events Section'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, '-'))} 
                    className="text-slate-300 hover:text-white font-black uppercase text-sm tracking-tight flex items-center gap-2 group transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Block */}
          <div className="md:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/80">Protocol Support //</h4>
            <div className="space-y-4">
              <button onClick={handleCall} className="w-full flex items-center gap-5 p-4 bg-slate-800/30 border border-slate-700 rounded-[1.5rem] hover:border-cyan-500/40 transition-all group text-left">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-500">
                  <Phone className="w-5 h-5 text-cyan-400 group-hover:text-slate-950" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Live Line</p>
                  <p className="text-sm font-black text-slate-200">+91 93515 69865</p>
                </div>
              </button>

              <button onClick={handleEmail} className="w-full flex items-center gap-5 p-4 bg-slate-800/30 border border-slate-700 rounded-[1.5rem] hover:border-cyan-500/40 transition-all group text-left">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-500">
                  <Mail className="w-5 h-5 text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Encryption Mail</p>
                  <p className="text-sm font-black text-slate-200">support@passhub.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Status & Copyright */}
        <div className="pt-10 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Nominal</span>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} PassHub Protocol
            </p>
          </div>
          
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Security'].map(link => (
              <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;