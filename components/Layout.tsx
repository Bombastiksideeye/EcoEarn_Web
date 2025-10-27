'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'}
        lg:block lg:relative lg:translate-x-0 lg:z-40
        ${isMobileMenuOpen ? 'translate-x-0' : 'lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          onToggle={setIsSidebarExpanded}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={setIsMobileMenuOpen}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">EcoEarn Admin</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
