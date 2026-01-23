// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import ActionModal from '../../components/admin/ActionModal';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api.get('/places').then(res => setEvents(res.data.places));
  }, []);

  const handleCancel = (eventId) => setModal({ type: 'cancelEvent', id: eventId });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Events</h1>
      <ul>
        {events.map(event => (
          <li key={event._id} className="flex justify-between p-2 border">
            {event.name}
            <button onClick={() => handleCancel(event._id)} className="bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
          </li>
        ))}
      </ul>
      {modal && <ActionModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default ManageEvents;