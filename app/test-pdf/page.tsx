'use client';

import React, { useState } from 'react';
import { PDFReportGenerator, DashboardData, fetchComprehensiveData } from '@/lib/pdf-generator';
import { Download } from 'lucide-react';

const TestPDFPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const sampleData: DashboardData = {
    selectedYear: 2024,
    userStats: {
      totalUsers: 1250,
      activeUsers: 980,
      inactiveUsers: 270,
      userReports: 45
    },
    recyclingStats: {
      plastic: 2500,
      glass: 1800
    },
    barChartData: [
      { name: 'Plastic', value: 2500, color: '#7B61FF' },
      { name: 'Tin Cans', value: 1800, color: '#FFA500' }
    ],
    generatedAt: new Date()
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Use sample data for testing
      const pdfGenerator = new PDFReportGenerator();
      await pdfGenerator.generateReport(sampleData);
      pdfGenerator.saveReport('EcoEarn_Sample_Report.pdf');
      
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRealDataPDF = async () => {
    try {
      setIsGenerating(true);
      
      // Fetch real data from Firestore
      const realData = await fetchComprehensiveData(2024);
      const pdfGenerator = new PDFReportGenerator();
      await pdfGenerator.generateReport(realData);
      pdfGenerator.saveReport('EcoEarn_Real_Data_Report.pdf');
      
      console.log('Real data PDF generated successfully!');
    } catch (error) {
      console.error('Error generating real data PDF:', error);
      alert('Failed to generate real data PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          EcoEarn PDF Report Test
        </h1>
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Sample Data:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Total Users: {sampleData.userStats.totalUsers}</li>
              <li>• Active Users: {sampleData.userStats.activeUsers}</li>
              <li>• Plastic Recycled: {sampleData.recyclingStats.plastic} kg</li>
              <li>• Glass/Tin Cans: {sampleData.recyclingStats.glass} kg</li>
              <li>• User Reports: {sampleData.userStats.userReports}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Sample PDF Report</span>
              </>
            )}
          </button>

          <button
            onClick={handleGenerateRealDataPDF}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Real Data PDF Report</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          This will generate a comprehensive PDF report with the sample data above.
        </p>
      </div>
    </div>
  );
};

export default TestPDFPage;
