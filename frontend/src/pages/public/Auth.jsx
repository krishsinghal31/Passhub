// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../context/AuthContext';
// import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

// const Auth = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [form, setForm] = useState({ email: '', password: '', name: '', role: 'VISITOR' });
//   const { login, register } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
    
//     try {
//       if (isLogin) {
//         const result = await login(form.email, form.password);
//         if (result.success) {
//           if (result.role === 'SUPER_ADMIN' || result.role === 'ADMIN') {
//             navigate('/admin');
//           } else {
//             navigate('/dashboard');
//           }
//         }
//       } else {
//         await register(form);
//         alert('Registered successfully! Please login with your credentials.');
//         setIsLogin(true);
//         setForm({ email: '', password: '', name: '', role: 'VISITOR' });
//       }
//     } catch (err) {
//       setError(err.message || err.response?.data?.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
//           <div className="text-center mb-8">
//             <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//               <LogIn className="text-white" size={40} />
//             </div>
//             <h1 className="text-3xl font-black text-gray-900 mb-2">
//               {isLogin ? 'Welcome Back' : 'Create Account'}
//             </h1>
//             <p className="text-gray-600">
//               {isLogin ? 'Sign in to continue to PassHub' : 'Join PassHub and start managing events'}
//             </p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
//               <span className="text-red-500">⚠️</span>
//               <span className="text-sm font-semibold">{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {!isLogin && (
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <User className="text-gray-400" size={20} />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Enter your name"
//                     className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Mail className="text-gray-400" size={20} />
//                 </div>
//                 <input
//                   type="email"
//                   placeholder="your.email@example.com"
//                   className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Lock className="text-gray-400" size={20} />
//                 </div>
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Enter your password"
//                   className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="text-gray-400 hover:text-gray-600" size={20} />
//                   ) : (
//                     <Eye className="text-gray-400 hover:text-gray-600" size={20} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button 
//               type="submit" 
//               className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
//                   {isLogin ? 'Sign In' : 'Create Account'}
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <button
//               onClick={() => {
//                 setIsLogin(!isLogin);
//                 setError('');
//                 setForm({ email: '', password: '', name: '', role: 'VISITOR' });
//               }}
//               className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
//             >
//               {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;



// src/components/auth/Auth.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Zap, ShieldCheck, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'VISITOR' });
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const result = await login(form.email, form.password);
        if (result.success) {
          navigate(result.role === 'SUPER_ADMIN' || result.role === 'ADMIN' ? '/admin' : '/dashboard');
        }
      } else {
        await register(form);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-cyan-500/50 transition-all outline-none font-bold text-white placeholder:text-slate-600 shadow-inner";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-slate-800 shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur group-hover:bg-cyan-500/40 transition-all" />
              <Zap className="text-cyan-400 relative z-10" size={38} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              {isLogin ? 'Initialize' : 'Register'}
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
              {isLogin ? 'System Access Protocol' : 'Create New Identity'}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 flex items-center gap-3 animate-pulse">
              <span className="font-black text-[10px] uppercase tracking-widest">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="group">
                <label className={labelClasses}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="IDENTIFIER NAME"
                    className={inputClasses}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className={labelClasses}>Protocol Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="USER@SYSTEM.COM"
                  className={inputClasses}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className={labelClasses}>Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={inputClasses}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-cyan-500 text-slate-950 py-5 rounded-[1.5rem] hover:bg-cyan-400 active:scale-95 transition-all font-black text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-cyan-500/20 mt-4 flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Authenticate' : 'Establish Link')}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setForm({ email: '', password: '', name: '', role: 'VISITOR' });
              }}
              className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] hover:text-cyan-400 transition-colors"
            >
              {isLogin ? "Generate New Access Credentials" : 'Return to Login Protocol'}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-700 font-bold text-[8px] uppercase tracking-[0.5em]">
          Secured by PassHub Encryption Layer
        </p>
      </div>
    </div>
  );
};

export default Auth;