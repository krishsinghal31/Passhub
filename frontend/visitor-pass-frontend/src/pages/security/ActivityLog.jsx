import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import PageWrapper from '../../components/common/PageWrapper';
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/security/activity');
                if (res.data.success) setLogs(res.data.invalidAttempts || []);
            } finally { setLoading(false); }
        };
        fetchLogs();
    }, []);

    return (
        <PageWrapper className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <History className="text-indigo-600" /> Recent Scan Activity
            </h2>
            <div className="space-y-4">
                {logs.map((log, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {log.reason ? <XCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                            <div>
                                <p className="font-bold text-gray-800">{log.reason || "Success Entry"}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock size={12} /> {new Date(log.time).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-mono bg-slate-100 p-1 px-2 rounded">
                            ID: {log.qrCode?.slice(0, 8)}...
                        </span>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
};

export default ActivityLog;