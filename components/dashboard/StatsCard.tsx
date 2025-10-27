'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor 
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${bgColor} flex-shrink-0 ml-2`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
