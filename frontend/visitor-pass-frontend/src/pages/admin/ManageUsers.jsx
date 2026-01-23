// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import ActionModal from '../../components/admin/ActionModal';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.users));
  }, []);

  const handleDisable = (userId) => setModal({ type: 'disableUser', id: userId });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <ul>
        {users.map(user => (
          <li key={user._id} className="flex justify-between p-2 border">
            {user.name} - {user.role}
            <button onClick={() => handleDisable(user._id)} className="bg-red-500 text-white px-2 py-1 rounded">Disable</button>
          </li>
        ))}
      </ul>
      {modal && <ActionModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default ManageUsers;