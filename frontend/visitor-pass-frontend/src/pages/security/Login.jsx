// import React, { useContext, useEffect, useMemo, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Mail, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
// import PageWrapper from '../../components/common/PageWrapper';
// import api from '../../utils/api';
// import { AuthContext } from '../../context/AuthContext';

// const SecurityLogin = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { refreshUser } = useContext(AuthContext);

//   const placeIdFromState = location.state?.placeId || '';
//   const placeNameFromState = location.state?.placeName || '';

//   const [form, setForm] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const title = useMemo(() => {
//     if (placeNameFromState) return `Staff Entry • ${placeNameFromState}`;
//     return 'Staff Entry';
//   }, [placeNameFromState]);

//   useEffect(() => {
//     setError('');
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const res = await api.post('/auth/login', form);
//       if (!res.data?.success) {
//         setError(res.data?.message || 'Login failed');
//         return;
//       }

//       localStorage.setItem('token', res.data.token);
//       await refreshUser();

//       // Verify SECURITY role + assignment
//       const meRes = await api.get('/auth/me');
//       const role = meRes.data?.user?.role;
//       if (role !== 'SECURITY') {
//         localStorage.removeItem('token');
//         setError('This account is not Security staff.');
//         return;
//       }

//       const workRes = await api.get('/security/my-assignments');
//       const assignments = workRes.data?.assignments || [];

//       if (placeIdFromState) {
//         const hasThis = assignments.some((a) => a?.place?._id === placeIdFromState);
//         if (!hasThis) {
//           setError('You are not assigned to this event.');
//           return;
//         }
//         navigate(`/security/dashboard/${placeIdFromState}`);
//         return;
//       }

//       // No placeId passed: go to security portal and let them pick
//       if (assignments.length === 0) {
//         setError('No active assignments found for this account.');
//         return;
//       }
//       navigate(`/security/dashboard/${assignments[0].place._id}`);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <PageWrapper className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-6">
//       <div className="max-w-lg mx-auto">
//         <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 border border-slate-100">
//           <div className="text-center mb-10">
//             <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
//               <Shield className="w-10 h-10" />
//             </div>
//             <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
//             <p className="text-slate-500 mt-2 font-medium">Login with your security staff account</p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-6">
//             <div>
//               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
//                 Email
//               </label>
//               <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
//                 <Mail className="w-5 h-5 text-slate-400 ml-4" />
//                 <input
//                   type="email"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   className="w-full p-4 pl-3 bg-transparent outline-none font-bold text-slate-700"
//                   placeholder="staff@email.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
//                 Password
//               </label>
//               <div className="relative flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 focus-within:bg-white transition-all">
//                 <Lock className="w-5 h-5 text-slate-400 ml-4" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   className="w-full p-4 pl-3 pr-12 bg-transparent outline-none font-bold text-slate-700"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((v) => !v)}
//                   className="absolute right-4 text-slate-400 hover:text-indigo-600 transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
//                 <p className="text-red-600 text-xs font-black uppercase tracking-tight">{error}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-60 flex items-center justify-center gap-3"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Signing in...
//                 </>
//               ) : (
//                 <>
//                   Enter Portal <ArrowRight size={18} />
//                 </>
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </PageWrapper>
//   );
// };

// export default SecurityLogin;



import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import PageWrapper from '../../components/common/PageWrapper';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const SecurityLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useContext(AuthContext);

  const placeIdFromState = location.state?.placeId || '';
  const placeNameFromState = location.state?.placeName || '';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(() => {
    return placeNameFromState ? `Staff Entry • ${placeNameFromState}` : 'Staff Entry';
  }, [placeNameFromState]);

  useEffect(() => { setError(''); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', form);
      if (!res.data?.success) throw new Error(res.data?.message || 'Login failed');

      localStorage.setItem('token', res.data.token);
      await refreshUser();

      const meRes = await api.get('/auth/me');
      if (meRes.data?.user?.role !== 'SECURITY') {
        localStorage.removeItem('token');
        throw new Error('This account is not Security staff.');
      }

      const workRes = await api.get('/security/my-assignments');
      const assignments = workRes.data?.assignments || [];

      if (placeIdFromState) {
        if (!assignments.some((a) => a?.place?._id === placeIdFromState)) {
          throw new Error('You are not assigned to this event.');
        }
        navigate(`/security/dashboard/${placeIdFromState}`);
      } else if (assignments.length > 0) {
        navigate(`/security/dashboard/${assignments[0].place._id}`);
      } else {
        throw new Error('No active assignments found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.1)] p-10 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 rotate-3">
              <Shield className="w-10 h-10 -rotate-3" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
            <p className="text-slate-500 mt-2 font-medium">Secure Portal Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl animate-in fade-in slide-in-from-top-2">
                <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:opacity-60 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enter Portal'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SecurityLogin;