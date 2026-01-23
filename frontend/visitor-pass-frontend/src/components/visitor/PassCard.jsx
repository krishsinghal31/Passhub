import React from 'react';
import { Calendar, MapPin, User, QrCode, CheckCircle, X } from 'lucide-react';

const PassCard = ({ pass, onCancel }) => {  // Added onCancel prop
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const statusColors = {
    APPROVED: 'bg-green-100 text-green-700 border-green-300',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {pass.place?.name || 'Event'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{pass.guest?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(pass.visitDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{pass.place?.location}</span>
            </div>
          </div>
        </div>

        {pass.qrImage && (
          <div className="flex flex-col items-center gap-2">
            <img 
              src={pass.qrImage} 
              alt="QR Code" 
              className="w-24 h-24 border-2 border-white rounded-lg shadow-md bg-white p-1"
            />
            <span className="text-xs text-gray-500">Scan to Enter</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[pass.status] || statusColors.PENDING}`}>
          {pass.status}
        </span>
        {pass.slotNumber && (
          <span className="text-sm font-semibold text-indigo-600">
            Slot #{pass.slotNumber}
          </span>
        )}
      </div>

      {pass.checkInTime && (
        <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            Checked in at {new Date(pass.checkInTime).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Added Cancel Button */}
      {onCancel && pass.status !== 'CANCELLED' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onCancel(pass)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Pass
          </button>
        </div>
      )}
    </div>
  );
};

export default PassCard;