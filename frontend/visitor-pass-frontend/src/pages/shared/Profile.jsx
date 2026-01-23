// src/pages/shared/Profile.jsx - PRODUCTION VERSION
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Calendar, Camera, Edit2, Save, X,
  CreditCard, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import PageWrapper from '../../components/common/PageWrapper';
import BackButton from '../../components/common/BackButton';
import ProfilePictureUpload from '../../components/common/ProfilePictureUpload';
import api from '../../utils/api';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = () => {
    const userId = user._id || user.id;
    const savedPicture = localStorage.getItem(`profile_picture_${userId}`);
    if (savedPicture) {
      setProfilePicture(savedPicture);
    }
    
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  const handleProfilePictureUpdate = (imageData) => {
    setProfilePicture(imageData);
    setShowUpload(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/update-profile', form);
      if (res.data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500 text-lg">Please log in to view your profile</p>
        </div>
      </PageWrapper>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <BackButton to="/dashboard" />

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white shadow-xl">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <span className="text-5xl font-bold text-indigo-600">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-50 transition-all transform hover:scale-110"
              >
                <Camera className="w-5 h-5 text-indigo-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-indigo-100 mb-3">{user.email}</p>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {user.role}
                </span>
                {user.subscription?.isActive && (
                  <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Active Subscription
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-semibold shadow-lg flex items-center gap-2"
            >
              {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
          
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                  <User className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 pl-3 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                  <Mail className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3 pl-3 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-800">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-800">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Details */}
        {user.subscription && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Subscription Details</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <p className="font-semibold text-gray-700">Plan</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {user.subscription.planId?.name || user.subscription.planName || 'Default'}
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                  <p className="font-semibold text-gray-700">Days Remaining</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {user.subscription.daysRemaining || 0} days
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  {user.subscription.isActive ? (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <p className="font-semibold text-gray-700">Status</p>
                </div>
                <p className={`text-2xl font-bold ${user.subscription.isActive ? 'text-purple-600' : 'text-red-600'}`}>
                  {user.subscription.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {user.subscription.endDate && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Valid Until:</strong> {formatDate(user.subscription.endDate)}
                </p>
              </div>
            )}

            {!user.subscription.isActive && (
              <button
                onClick={() => navigate('/subscriptions')}
                className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                Renew Subscription
              </button>
            )}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg"
        >
          Logout
        </button>
      </div>

      {/* Profile Picture Upload Modal */}
      {showUpload && (
        <ProfilePictureUpload
          currentImage={profilePicture}
          onImageUpdate={handleProfilePictureUpdate}
          onClose={() => setShowUpload(false)}
          userId={user._id || user.id}
        />
      )}
    </PageWrapper>
  );
};

export default Profile;