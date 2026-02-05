 // src/components/common/ProfilePictureUpload.jsx
 import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User, Check } from 'lucide-react';

const ProfilePictureUpload = ({ currentImage, onImageUpdate, onClose, userId }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetImage = async () => {
    if (preview) {
      setIsProcessing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const storageKey = `profile_picture_${userId}`;
        localStorage.setItem(storageKey, preview);
        
        await onImageUpdate(preview);
        
        onClose();
      } catch (error) {
        console.error("Failed to save image:", error);
        alert("Could not save image. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Update Photo</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personalize your profile</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-slate-50 flex items-center justify-center border-4 border-white shadow-xl">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-200" />
              )}
            </div>
            {preview && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-xl shadow-lg border-4 border-white">
                <Check size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Upload Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
          >
            <Camera className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-600 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-purple-600 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-purple-600">Gallery</span>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setPreview(currentImage || null);
            }}
            className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!preview || isProcessing}
            onClick={handleSetImage}
            className={`flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2
              ${!preview || isProcessing 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : "Set Picture"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;