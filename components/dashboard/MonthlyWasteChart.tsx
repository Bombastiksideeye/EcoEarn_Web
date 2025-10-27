'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminService } from '@/lib/admin-service';

interface MonthlyWasteChartProps {
  selectedYear: number;
  onYearChanged: (year: number) => void;
}

const MonthlyWasteChart: React.FC<MonthlyWasteChartProps> = ({ 
  selectedYear, 
  onYearChanged 
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const adminService = new AdminService();
        const [stats, years] = await Promise.all([
          adminService.getMonthlyRecyclingStats(selectedYear),
          adminService.getAvailableYears()
        ]);
        
        setAvailableYears(years);
        
        const formattedData = months.map((month, index) => ({
          month,
          plastic: stats.plastic.data[index] || 0,
          glass: stats.glass.data[index] || 0,
        }));
        
        setChartData(formattedData);
      } catch (err) {
        setError('Failed to load chart data');
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80 text-red-600">
          <div className="text-center">
            <p className="text-sm sm:text-base lg:text-lg font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 lg:mb-6 gap-2 sm:gap-3 relative z-10 overflow-hidden">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Waste Collection Summary</h3>
        <div className="relative z-20 w-full sm:w-auto min-w-0">
          <select
            value={selectedYear}
            onChange={(e) => onYearChanged(parseInt(e.target.value))}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm lg:text-base w-full sm:w-auto bg-white relative z-30 min-w-0"
            style={{ maxWidth: '100%', minWidth: '0' }}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center space-x-3 sm:space-x-4 lg:space-x-6 mb-3 sm:mb-4 lg:mb-6">
        <div className="flex items-center">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-600 rounded mr-1 sm:mr-2"></div>
          <span className="text-xs sm:text-sm text-gray-600">Plastic Bottle</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded mr-1 sm:mr-2"></div>
          <span className="text-xs sm:text-sm text-gray-600">Tin Can</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 8, fill: '#666' }}
              tickLine={{ stroke: '#d1d5db' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 8, fill: '#666' }}
              tickLine={{ stroke: '#d1d5db' }}
              domain={[0, 'dataMax']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '11px',
                padding: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="plastic"
              stroke="#7B61FF"
              strokeWidth={1.5}
              dot={{ fill: '#7B61FF', strokeWidth: 1, r: 2 }}
              activeDot={{ r: 4, stroke: '#7B61FF', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="glass"
              stroke="#FFA500"
              strokeWidth={1.5}
              dot={{ fill: '#FFA500', strokeWidth: 1, r: 2 }}
              activeDot={{ r: 4, stroke: '#FFA500', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyWasteChart;
