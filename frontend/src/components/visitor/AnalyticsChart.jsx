// frontend/visitor-pass-frontend/src/components/visitor/AnalyticsChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';

const AnalyticsChart = ({ data }) => (
  <div className="p-4">
    <Bar data={data} />
  </div>
);

export default AnalyticsChart;