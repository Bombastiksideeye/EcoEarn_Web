'use client';

import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import HorizontalBarChart from '@/components/dashboard/HorizontalBarChart';
import MonthlyWasteChart from '@/components/dashboard/MonthlyWasteChart';
import MaterialsSection from '@/components/dashboard/MaterialsSection';
import RecentRecycles from '@/components/dashboard/RecentRecycles';
import { AdminService } from '@/lib/admin-service';
import { PDFReportGenerator, generateDashboardPDF, DashboardData, fetchComprehensiveData } from '@/lib/pdf-generator';
import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    userReports: 0,
  });
  const [recyclingStats, setRecyclingStats] = useState({
    plastic: 0,
    glass: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const adminService = new AdminService();
        
        const [
          years,
          userStatsData,
          recyclingStatsData,
          reportsCount
        ] = await Promise.all([
          adminService.getAvailableYears(),
          adminService.getUserStats(),
          adminService.getTotalRecyclingStats(),
          adminService.getReportsCount()
        ]);

        setAvailableYears(years);
        setUserStats({
          ...userStatsData,
          userReports: reportsCount
        });
        setRecyclingStats(recyclingStatsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleDownloadReport = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Fetch comprehensive data from Firestore
      const dashboardData = await fetchComprehensiveData(selectedYear);

      // Generate PDF report
      const pdfGenerator = new PDFReportGenerator();
      await pdfGenerator.generateReport(dashboardData);
      pdfGenerator.saveReport(`EcoEarn_Report_${selectedYear}.pdf`);
      
      console.log('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const barChartData = [
    { 
      name: 'Plastic', 
      value: Number(recyclingStats.plastic) || 0, 
      color: '#7B61FF' 
    },
    { 
      name: 'Tin Cans', 
      value: Number(recyclingStats.glass) || 0, 
      color: '#FFA500' 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

   return (
     <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome to EcoEarn Admin Panel</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Year Picker */}
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="border-none outline-none bg-transparent text-xs sm:text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF}
            className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors ${
              isGeneratingPDF 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700'
            } text-white text-sm sm:text-base`}
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="font-medium hidden sm:inline">Generating PDF...</span>
                <span className="font-medium sm:hidden">Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Download Report</span>
                <span className="font-medium sm:hidden">Download</span>
              </>
            )}
          </button>
        </div>
      </div>

       {/* Statistics Cards Row */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
         <StatsCard
           title="Total Users"
           value={userStats.totalUsers}
           icon={Users}
           color="text-blue-600"
           bgColor="bg-blue-100"
         />
         <StatsCard
           title="Active Users"
           value={userStats.activeUsers}
           icon={UserCheck}
           color="text-green-600"
           bgColor="bg-green-100"
         />
         <StatsCard
           title="User Reports"
           value={userStats.userReports}
           icon={AlertTriangle}
           color="text-red-600"
           bgColor="bg-red-100"
         />
         <StatsCard
           title="Inactive Users"
           value={userStats.inactiveUsers}
           icon={UserX}
           color="text-orange-600"
           bgColor="bg-orange-100"
         />
       </div>

       {/* Main Content Grid */}
       <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
         {/* Left Column - Statistics, Materials, and Waste Collection */}
         <div className="xl:col-span-3 space-y-4 lg:space-y-6">
           {/* Statistics and Materials Row */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
             {/* Recycling Statistics Bar Chart */}
             <div className="h-48 sm:h-64 lg:h-80">
               <HorizontalBarChart data={barChartData} />
             </div>
             
             {/* Materials Section */}
             <div className="h-auto sm:h-64 lg:h-80">
               <MaterialsSection />
             </div>
           </div>
           
           {/* Waste Collection Summary - Full Width */}
           <div className="h-64 sm:h-72 lg:h-80">
             <MonthlyWasteChart
               selectedYear={selectedYear}
               onYearChanged={handleYearChange}
             />
           </div>
         </div>

         {/* Right Column - Recent Recycles - Full Height */}
         <div className="xl:col-span-1">
           <div className="h-48 sm:h-64 lg:h-full mt-4 sm:mt-6 lg:mt-0">
             <RecentRecycles />
           </div>
         </div>
       </div>

    </div>
  );
};

export default DashboardPage;
