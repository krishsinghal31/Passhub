// src/pages/security/Login.jsx
import React, { useState } from 'react';
import api from '../../utils/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', placeId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/security/login', form);
      alert('Logged in as security!');
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Security Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          placeholder="Place ID"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, placeId: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
};

export default Login;