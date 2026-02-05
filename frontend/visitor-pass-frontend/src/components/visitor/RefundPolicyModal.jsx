// frontend/visitor-pass-frontend/src/components/visitor/RefundPolicyModal.jsx
import React from 'react';

const RefundPolicyModal = ({ policy, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded">
      <h3>Refund Policy</h3>
      <p>{policy.description}</p>
      <button onClick={onClose} className="bg-primary text-white px-4 py-2 rounded">Close</button>
    </div>
  </div>
);

export default RefundPolicyModal;