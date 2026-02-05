// src/components/common/ProfilePictureUpload.jsx 
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

const ProfilePictureUpload = ({ currentImage, onImageUpdate, onClose, userId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setSelectedImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetImage = async () => {
    if (preview) {
      const storageKey = `profile_picture_${userId}`;
      localStorage.setItem(storageKey, preview);
      
      await onImageUpdate(preview);
      onClose();
    }
  };

  const handleCancel = () => {
    setPreview(currentImage || null);
    setSelectedImage(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Update Profile Picture</h3>
          <button 
            onClick={handleCancel} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-indigo-200">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-indigo-400" />
            )}
          </div>
        </div>

        {/* Upload Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
          >
            <Camera className="w-8 h-8 text-indigo-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700">Camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
          >
            <Upload className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700">Gallery</span>
          </button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {/* FIXED: Mobile camera capture */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        {preview && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSetImage}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Set Picture
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;