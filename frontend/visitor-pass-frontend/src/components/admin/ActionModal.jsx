// frontend/visitor-pass-frontend/src/components/admin/ActionModal.jsx
import React, { useState } from 'react';
import api from '../../utils/api';

const ActionModal = ({ type, id, onClose }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      if (type === 'disableHost') await api.post(`/admin/hosts/${id}/disable`, { reason });
      onClose();
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
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