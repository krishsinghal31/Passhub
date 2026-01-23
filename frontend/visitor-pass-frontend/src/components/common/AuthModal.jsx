// frontend/visitor-pass-frontend/src/components/common/AuthModal.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { XMarkIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in border border-purple-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join PassHub'}
            </h2>
            <p className={`text-sm mt-2 ${isLogin ? 'text-indigo-600' : 'text-purple-600'} font-medium`}>
              {isLogin ? 'Login to access your own events.' : 'Create your account to start managing events.'}
            </p>
            {isLogin && <div className="w-16 h-1 bg-indigo-500 rounded-full mt-2"></div>}
            {!isLogin && <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2"></div>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <label className="block text-sm font-medium text-purple-700 mb-2">Full Name</label>
              <div className="flex items-center border border-purple-300 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200 bg-purple-50 hover:bg-white">
                <UserIcon className="h-5 w-5 text-purple-400 ml-3" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-4 pl-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
                  required
                />
              </div>
            </div>
          )}
          <div className="relative">
            <label className={`block text-sm font-medium mb-2 ${isLogin ? 'text-indigo-700' : 'text-purple-700'}`}>
              Email Address
            </label>
            <div className={`flex items-center border rounded-xl focus-within:ring-2 transition-all duration-200 bg-gray-50 hover:bg-white ${isLogin ? 'border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500' : 'border-purple-300 focus-within:ring-purple-500 focus-within:border-purple-500'}`}>
              <EnvelopeIcon className={`h-5 w-5 ml-3 ${isLogin ? 'text-gray-400' : 'text-purple-400'}`} />
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-4 pl-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
                required
              />
            </div>
          </div>
          <div className="relative">
            <label className={`block text-sm font-medium mb-2 ${isLogin ? 'text-indigo-700' : 'text-purple-700'}`}>
              Password
            </label>
            <div className={`flex items-center border rounded-xl focus-within:ring-2 transition-all duration-200 bg-gray-50 hover:bg-white ${isLogin ? 'border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500' : 'border-purple-300 focus-within:ring-purple-500 focus-within:border-purple-500'}`}>
              <LockClosedIcon className={`h-5 w-5 ml-3 ${isLogin ? 'text-gray-400' : 'text-purple-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-4 pl-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors ${isLogin ? 'text-gray-400' : 'text-purple-400'}`}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isLogin ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "New to PassHub?" : 'Already have an account?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-semibold ml-2 transition-colors duration-200 ${isLogin ? 'text-indigo-600 hover:text-indigo-800' : 'text-purple-600 hover:text-purple-800'}`}
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;