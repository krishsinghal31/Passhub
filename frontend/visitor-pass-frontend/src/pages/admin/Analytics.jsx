// src/pages/admin/Analytics.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import TrafficChart from '../../components/admin/TrafficChart';

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/admin/peak-activity').then(res => setData(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Analytics</h1>
      {data && <TrafficChart data={data} />}
    </div>
  );
};

export default Analytics;