// frontend/visitor-pass-frontend/src/components/admin/TrafficChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';

const TrafficChart = ({ data }) => (
  <div className="p-4">
    <Line data={data} />
  </div>
);

export default TrafficChart;