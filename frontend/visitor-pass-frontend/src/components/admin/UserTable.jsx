// frontend/visitor-pass-frontend/src/components/admin/UserTable.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const UserTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.users));
  }, []);

  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td><button className="bg-red-500 text-white px-2 py-1 rounded">Disable</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;