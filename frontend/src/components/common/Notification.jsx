// frontend/visitor-pass-frontend/src/components/common/Notification.jsx
import React, { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded shadow-md ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
      {message}
      <button onClick={onClose} className="ml-4">&times;</button>
    </div>
  );
};

export default Notification;