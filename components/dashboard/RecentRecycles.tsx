'use client';

import React, { useState, useEffect } from 'react';
import { AdminService, RecyclingRequest } from '@/lib/admin-service';

const RecentRecycles: React.FC = () => {
  const [recycles, setRecycles] = useState<RecyclingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRecycles = async () => {
      try {
        const adminService = new AdminService();
        const recyclesList = await adminService.getRecentRecycles();
        console.log('Recent recycles data:', recyclesList);
        setRecycles(recyclesList);
      } catch (error) {
        console.error('Error fetching recent recycles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRecycles();
  }, []);

  if (loading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 h-full flex flex-col bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Recent Recycles</h3>
        <div className="flex justify-center flex-1 items-center">
          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 h-full flex flex-col bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Recent Recycles</h3>
      <div className="space-y-1.5 sm:space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {recycles.length === 0 ? (
          <p className="text-gray-500 text-center py-3 sm:py-4 lg:py-6 text-xs sm:text-sm">No recent recycles found</p>
        ) : (
          recycles.map((recycle) => (
            <div
              key={recycle.id}
              className="flex items-start p-2 sm:p-2.5 lg:p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full flex items-center justify-center mr-2 sm:mr-2.5 lg:mr-3 overflow-hidden flex-shrink-0 mt-0.5">
                {recycle.profilePicture ? (
                  <>
                    {console.log('Rendering profile picture for:', recycle.userName, 'Length:', recycle.profilePicture?.length)}
                    <img
                      src={`data:image/jpeg;base64,${recycle.profilePicture}`}
                      alt={`${recycle.userName || 'User'}'s profile`}
                      className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                      onLoad={() => console.log('Profile picture loaded successfully for:', recycle.userName)}
                      onError={(e) => {
                        console.log('Profile picture failed to load for:', recycle.userName);
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-gray-600 font-medium text-xs">${recycle.userName?.charAt(0) || 'U'}</span>`;
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    {console.log('No profile picture for:', recycle.userName)}
                    <span className="text-gray-600 font-medium text-xs">
                      {recycle.userName?.charAt(0) || 'U'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate">{recycle.userName || 'Unknown'}</p>
                <p className="text-xs text-gray-600 truncate leading-tight">
                  {recycle.timestamp ? 
                    new Date(recycle.timestamp.seconds * 1000).toLocaleDateString() : 
                    'Unknown date'
                  } | {recycle.timestamp ? 
                    new Date(recycle.timestamp.seconds * 1000).toLocaleTimeString() : 
                    'Unknown time'
                  }
                </p>
                <p className="text-xs text-gray-500 truncate leading-tight">
                  Material: {recycle.materialType || 'Unknown'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentRecycles;
