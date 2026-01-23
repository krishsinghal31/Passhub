// src/pages/visitor/Analytics.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import AnalyticsChart from '../../components/visitor/AnalyticsChart';

const Analytics = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/analytics/place/${eventId}/visit-stats`).then(res => setData(res.data));
  }, [eventId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Event Analytics</h1>
      {data && <AnalyticsChart data={data} />}
    </div>
  );
};

export default Analytics;