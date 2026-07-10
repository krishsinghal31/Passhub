 // src/components/visitor/CancelMultiplePassesModal.jsx

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const CancelMultiplePassesModal = ({ passCount, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Cancel Multiple Passes</h3>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel <strong>{passCount}</strong> selected pass{passCount !== 1 ? 'es' : ''}?
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">⚠️ Important:</p>
            <p>This action cannot be undone. Refunds will be calculated individually based on cancellation policies and processed within 5-7 business days.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Keep Passes
          </button>
          <button
            onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg"
          >
            Cancel Passes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelMultiplePassesModal;