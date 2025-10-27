'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { AdminService, Report } from '@/lib/admin-service';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const adminService = new AdminService();
        const reportsList = await adminService.getReports();
        setReports(reportsList);
        setFilteredReports(reportsList);
      } catch (err) {
        setError('Failed to fetch reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports.filter(report =>
      report.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort reports
    if (sortFilter === 'Newest') {
      filtered.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
    } else {
      filtered.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [reports, searchQuery, sortFilter]);

  const getCurrentPageReports = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Mobile scrollable container */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                    <div className="min-w-[100px]">Username</div>
                    <div className="min-w-[80px]">Date</div>
                    <div className="min-w-[80px]">Time</div>
                    <div className="min-w-[120px]">Description</div>
                    <div className="min-w-[100px]">Location</div>
                    <div className="min-w-[80px]">Upload</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {getCurrentPageReports().map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="grid grid-cols-6 gap-4 text-sm text-gray-900">
                        <div className="font-medium min-w-[100px]">{report.userName || 'N/A'}</div>
                        <div className="min-w-[80px]">
                          {report.timestamp ? 
                            new Date(report.timestamp.seconds * 1000).toLocaleDateString() : 
                            'N/A'
                          }
                        </div>
                        <div className="min-w-[80px]">
                          {report.timestamp ? 
                            new Date(report.timestamp.seconds * 1000).toLocaleTimeString() : 
                            'N/A'
                          }
                        </div>
                        <div className="truncate min-w-[120px]">{report.description || 'N/A'}</div>
                        <div className="truncate min-w-[100px]">{report.location || 'N/A'}</div>
                        <div className="min-w-[80px]">{report.image ? 'Image' : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} entries
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-lg ${
                    currentPage === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
            
            {selectedReport ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Username</h4>
                  <p className="text-sm text-gray-900">{selectedReport.userName || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-900">{selectedReport.description || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                  <p className="text-sm text-gray-900">{selectedReport.location || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Date & Time</h4>
                  <p className="text-sm text-gray-900">
                    {selectedReport.timestamp ? 
                      new Date(selectedReport.timestamp.seconds * 1000).toLocaleString() : 
                      'N/A'
                    }
                  </p>
                </div>
                
                {selectedReport.image && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Image</h4>
                    <img
                      src={`data:image/jpeg;base64,${selectedReport.image}`}
                      alt="Report"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a report to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
