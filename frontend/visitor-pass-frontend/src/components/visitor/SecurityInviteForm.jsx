// frontend/visitor-pass-frontend/src/components/visitor/SecurityInviteForm.jsx
import React, { useState } from 'react';
import api from '../../utils/api';

const SecurityInviteForm = ({ placeId }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/host/places/${placeId}/invite-security`, { email });
      alert('Security invited!');
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input placeholder="Security Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Invite</button>
    </form>
  );
};

export default SecurityInviteForm;