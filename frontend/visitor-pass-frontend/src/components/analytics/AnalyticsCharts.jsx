// src/components/analytics/AnalyticsCharts.jsx 
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import api from '../../utils/api';

const AnalyticsCharts = ({ eventId, type = 'host' }) => {
  const [bookingsData, setBookingsData] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      if (type === 'host') {
        const [bookingsRes, peakRes] = await Promise.all([
          api.get(`/host/events/${eventId}/bookings-per-day`),
          api.get(`/host/events/${eventId}/peak-checkin-hours`)
        ]);

        if (bookingsRes.data.success) {
          setBookingsData(bookingsRes.data.dailyBookings || []);
        }
        if (peakRes.data.success) {
          setPeakHoursData(peakRes.data.peakHours || []);
        }
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  const maxBookings = Math.max(...bookingsData.map(d => d.bookings), 1);
  const maxCheckIns = Math.max(...peakHoursData.map(d => d.checkIns), 1);

  return (
    <div className="space-y-8">
      {/* Bookings Per Day - Bar Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Daily Bookings</h3>
            <p className="text-sm text-gray-600">Booking trends over time</p>
          </div>
        </div>

        {bookingsData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-80 flex items-end justify-around gap-2">
              {bookingsData.map((item, idx) => {
                const heightPercentage = (item.bookings / maxBookings) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group">
                    <div className="w-full relative">
                      {/* Tooltip */}
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <p className="text-xs font-semibold">{new Date(item.date).toLocaleDateString()}</p>
                        <p className="text-sm">Total: {item.bookings}</p>
                        <p className="text-xs text-green-300">Approved: {item.approved}</p>
                        <p className="text-xs text-yellow-300">Pending: {item.pending}</p>
                        <p className="text-xs text-red-300">Cancelled: {item.cancelled}</p>
                      </div>

                      {/* Stacked Bars */}
                      <div className="w-full flex flex-col-reverse">
                        {item.approved > 0 && (
                          <div
                            className="bg-green-500 hover:bg-green-600 transition-all duration-300 rounded-t-lg"
                            style={{ height: `${(item.approved / maxBookings) * 300}px` }}
                          ></div>
                        )}
                        {item.pending > 0 && (
                          <div
                            className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-300"
                            style={{ height: `${(item.pending / maxBookings) * 300}px` }}
                          ></div>
                        )}
                        {item.cancelled > 0 && (
                          <div
                            className="bg-red-500 hover:bg-red-600 transition-all duration-300"
                            style={{ height: `${(item.cancelled / maxBookings) * 300}px` }}
                          ></div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-700">Cancelled</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No booking data available</p>
        )}
      </div>

      {/* Peak Check-in Hours - Line Chart */}
      {peakHoursData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Peak Check-in Hours</h3>
              <p className="text-sm text-gray-600">Busiest times for entry</p>
            </div>
          </div>

          <div className="relative h-80">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
              <span>{maxCheckIns}</span>
              <span>{Math.floor(maxCheckIns * 0.75)}</span>
              <span>{Math.floor(maxCheckIns * 0.5)}</span>
              <span>{Math.floor(maxCheckIns * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-14 h-full border-l-2 border-b-2 border-gray-300 relative">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percentage) => (
                <div
                  key={percentage}
                  className="absolute w-full border-t border-gray-200"
                  style={{ bottom: `${percentage}%` }}
                ></div>
              ))}

              {/* Line chart */}
              <svg className="w-full h-full absolute top-0 left-0">
                <polyline
                  points={peakHoursData
                    .map((item, idx) => {
                      const x = (idx / (peakHoursData.length - 1)) * 100;
                      const y = 100 - (item.checkIns / maxCheckIns) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Data points */}
                {peakHoursData.map((item, idx) => {
                  const x = (idx / (peakHoursData.length - 1)) * 100;
                  const y = 100 - (item.checkIns / maxCheckIns) * 100;
                  return (
                    <g key={idx}>
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="6"
                        fill="white"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        className="cursor-pointer hover:r-8 transition-all"
                      />
                      <title>{item.hour}: {item.checkIns} check-ins</title>
                    </g>
                  );
                })}
              </svg>

              {/* X-axis labels */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs text-gray-600">
                {peakHoursData.map((item, idx) => (
                  <span key={idx}>{item.hour}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;