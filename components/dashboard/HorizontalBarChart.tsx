'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HorizontalBarChartProps {
  data: { name: string; value: number; color: string }[];
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  // Ensure data has valid values
  const processedData = data.map(item => ({
    ...item,
    value: Number(item.value) || 0
  }));
  
  return (
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Statistics</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#666' }}
            />
             <Tooltip 
               formatter={(value: any, name: any) => [value, '']}
               labelFormatter={(label: any) => `${label}`}
               contentStyle={{
                 backgroundColor: 'white',
                 border: '1px solid #e5e7eb',
                 borderRadius: '8px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                 fontSize: '12px'
               }}
             />
             <Bar 
               dataKey="value" 
               radius={[4, 4, 0, 0]}
             >
               {processedData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.color} />
               ))}
             </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8 mt-3 sm:mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs sm:text-sm text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalBarChart;
