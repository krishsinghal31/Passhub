// src/pages/shared/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="p-6 text-center">
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="mb-4">The page you're looking for doesn't exist.</p>
    <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go Home</Link>
  </div>
);

export default NotFound;