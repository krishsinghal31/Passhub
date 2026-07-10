// frontend/visitor-pass-frontend/src/components/security/ScanLog.jsx
import React from 'react';

const ScanLog = ({ logs }) => (
  <ul className="p-4">
    {logs.map(log => <li key={log._id}>{log.time} - {log.status}</li>)}
  </ul>
);

export default ScanLog;