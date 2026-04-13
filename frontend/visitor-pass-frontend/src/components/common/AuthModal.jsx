// // frontend/visitor-pass-frontend/src/components/common/AuthModal.jsx
// import React, { useState, useContext } from 'react';
// import { AuthContext } from '../../context/AuthContext';
// import { XMarkIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// const AuthModal = ({ isOpen, onClose }) => {
//   const { login, register } = useContext(AuthContext);
//   const [isLogin, setIsLogin] = useState(true);
//   const [form, setForm] = useState({ email: '', password: '', name: '' });
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (isLogin) {
//         await login(form.email, form.password);
//       } else {
//         await register(form.name, form.email, form.password);
//       }
//       onClose();
//     } catch (err) {
//       alert('Error: ' + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in border border-purple-200">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
//               {isLogin ? 'Welcome Back' : 'Join PassHub'}
//             </h2>
//             <p className={`text-sm mt-2 ${isLogin ? 'text-indigo-600' : 'text-purple-600'} font-medium`}>
//               {isLogin ? 'Login to access your own events.' : 'Create your account to start managing events.'}
//             </p>
//             {isLogin && <div className="w-16 h-1 bg-indigo-500 rounded-full mt-2"></div>}
//             {!isLogin && <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2"></div>}
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
//           >
//             <XMarkIcon className="h-6 w-6" />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {!isLogin && (
//             <div className="relative">
//               <label className="block text-sm font-medium text-purple-700 mb-2">Full Name</label>
//               <div className="flex items-center border border-purple-300 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200 bg-purple-50 hover:bg-white">
//                 <UserIcon className="h-5 w-5 text-purple-400 ml-3" />
//                 <input
//                   type="text"
//                   placeholder="Enter your name"
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   className="w-full p-4 pl-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
//                   required
//                 />
//               </div>
//             </div>
//           )}
//           <div className="relative">
//             <label className={`block text-sm font-medium mb-2 ${isLogin ? 'text-indigo-700' : 'text-purple-700'}`}>
//               Email Address
//             </label>
//             <div className={`flex items-center border rounded-xl focus-within:ring-2 transition-all duration-200 bg-gray-50 hover:bg-white ${isLogin ? 'border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500' : 'border-purple-300 focus-within:ring-purple-500 focus-within:border-purple-500'}`}>
//               <EnvelopeIcon className={`h-5 w-5 ml-3 ${isLogin ? 'text-gray-400' : 'text-purple-400'}`} />
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 className="w-full p-4 pl-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
//                 required
//               />
//             </div>
//           </div>
//           <div className="relative">
//             <label className={`block text-sm font-medium mb-2 ${isLogin ? 'text-indigo-700' : 'text-purple-700'}`}>
//               Password
//             </label>
//             <div className={`flex items-center border rounded-xl focus-within:ring-2 transition-all duration-200 bg-gray-50 hover:bg-white ${isLogin ? 'border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500' : 'border-purple-300 focus-within:ring-purple-500 focus-within:border-purple-500'}`}>
//               <LockClosedIcon className={`h-5 w-5 ml-3 ${isLogin ? 'text-gray-400' : 'text-purple-400'}`} />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="Enter your password"
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 className="w-full p-4 pl-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className={`mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors ${isLogin ? 'text-gray-400' : 'text-purple-400'}`}
//               >
//                 {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>
//           <button
//             type="submit"
//             className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isLogin ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'}`}
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Processing...
//               </>
//             ) : (
//               isLogin ? 'Sign In' : 'Create Account'
//             )}
//           </button>
//         </form>
//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             {isLogin ? "New to PassHub?" : 'Already have an account?'}
//             <button
//               onClick={() => setIsLogin(!isLogin)}
//               className={`font-semibold ml-2 transition-colors duration-200 ${isLogin ? 'text-indigo-600 hover:text-indigo-800' : 'text-purple-600 hover:text-purple-800'}`}
//             >
//               {isLogin ? 'Sign up here' : 'Sign in here'}
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;



// frontend/visitor-pass-frontend/src/components/common/AuthModal.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { XMarkIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 md:p-10 max-w-md w-full animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {isLogin ? 'Access your PassHub dashboard.' : 'Start managing your events effortlessly.'}
            </p>
            <div className={`h-1.5 w-12 rounded-full mt-4 transition-all duration-500 ${isLogin ? 'bg-indigo-600' : 'bg-slate-900'}`}></div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-all"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field (Sign Up Only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <div className="relative group">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="email"
                placeholder="name@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
            <div className="relative group">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setForm({ email: '', password: '', name: '' });
            }}
            className="group text-sm font-bold text-slate-500 hover:text-slate-900 transition-all"
          >
            {isLogin ? "New to PassHub? " : 'Already a member? '}
            <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px] ml-1 group-hover:underline">
              {isLogin ? 'Register' : 'Login'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;