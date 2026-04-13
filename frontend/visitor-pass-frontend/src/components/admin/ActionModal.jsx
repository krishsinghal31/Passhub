// frontend/visitor-pass-frontend/src/components/admin/ActionModal.jsx
import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ActionModal = ({ type, id, onClose }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      if (type === 'disableHost') await api.post(`/admin/hosts/${id}/disable`, { reason });
      toast.success('Action completed successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        <textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button onClick={handleSubmit} className="bg-primary text-white px-4 py-2 rounded">Submit</button>
        <button onClick={onClose} className="ml-2">Cancel</button>
      </div>
    </div>
  );
};

export default ActionModal;