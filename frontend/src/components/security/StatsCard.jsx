// frontend/visitor-pass-frontend/src/components/security/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default StatsCard;