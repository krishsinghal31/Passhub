// src/components/visitor/SecurityPersonnelCard.jsx
import React, { useState } from 'react';
import { Shield, Mail, Calendar, Trash2, CheckCircle, Clock } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

const SecurityPersonnelCard = ({ security, onRemove }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(security._id);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to remove security:', error);
    } finally {
      setRemoving(false);
    }
  };

  const statusColors = {
    ACCEPTED: 'bg-green-100 text-green-700 border-green-300',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    INACTIVE: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{security.name || 'Security Personnel'}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{security.email}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Security"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(security.assignmentPeriod?.start)} - {formatDate(security.assignmentPeriod?.end)}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[security.status] || statusColors.PENDING
            }`}>
              {security.status || 'PENDING'}
            </span>
            
            {security.isActive ? (
              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <CheckCircle className="w-4 h-4" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                <Clock className="w-4 h-4" />
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Remove Security Personnel"
        message={`Are you sure you want to remove ${security.email} from this event? This action cannot be undone.`}
        onConfirm={handleRemove}
        onCancel={() => setShowConfirm(false)}
        confirmText={removing ? 'Removing...' : 'Remove'}
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default SecurityPersonnelCard;