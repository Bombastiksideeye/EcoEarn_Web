'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Trash2, 
  Users, 
  History, 
  Wallet, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  isExpanded: boolean;
}

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  isExpanded: boolean;
  onMobileMenuToggle?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  title, 
  href, 
  icon: Icon, 
  isSelected, 
  isExpanded,
  onMobileMenuToggle
}) => {
  const handleClick = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      <div 
        className={`
          flex items-center p-3 mb-5 rounded-lg transition-colors duration-200
          ${isSelected 
            ? 'bg-primary-100 text-primary-800' 
            : 'text-gray-600 hover:bg-gray-100'
          }
          ${isExpanded ? 'ml-5' : 'ml-4'}
        `}
        title={!isExpanded ? title : undefined}
      >
        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-800' : 'text-gray-600'}`} />
        {isExpanded && (
          <span className="ml-3 text-sm font-medium">{title}</span>
        )}
      </div>
    </Link>
  );
};

interface SidebarProps {
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle, isMobileMenuOpen, onMobileMenuToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, adminData } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Bin Management', href: '/admin/bins', icon: Trash2 },
    { title: 'User Reports', href: '/admin/reports', icon: Users },
    { title: 'Activity Logs', href: '/admin/logs', icon: History },
    { title: 'Transactions', href: '/admin/transactions', icon: Wallet },
  ];

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className={`
      relative bg-white transition-all duration-300 h-full shadow-lg border-r border-gray-200
      ${isExpanded ? 'w-64' : 'w-20'}
      ${isMobileMenuOpen ? 'rounded-r-3xl' : 'lg:rounded-r-3xl'}
      z-50
    `}>
      <div className={`${isExpanded ? 'p-5' : 'p-3'} h-full flex flex-col`}>
        {/* Mobile Close Button */}
        {isMobileMenuOpen && (
          <div className="lg:hidden flex justify-end mb-4">
            <button
              onClick={() => onMobileMenuToggle?.(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Logo */}
        <div className="mb-12">
          {isExpanded ? (
            <div className="text-2xl font-bold text-primary-800">
              EcoEarn Admin
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              isSelected={pathname === item.href}
              isExpanded={isExpanded}
              onMobileMenuToggle={() => onMobileMenuToggle?.(false)}
            />
          ))}
        </nav>


        {/* Divider */}
        <div className="my-6 border-t border-gray-300"></div>

        {/* Logout */}
        <button
          onClick={() => {
            handleLogout();
            onMobileMenuToggle?.(false);
          }}
          disabled={isLoggingOut}
          className={`
            flex items-center p-3 mb-5 rounded-lg transition-colors duration-200
            text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed
            ${isExpanded ? 'ml-5' : 'ml-4'}
          `}
          title={!isExpanded ? 'Log out' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="ml-3 text-sm font-medium">Log out</span>}
        </button>
      </div>

      {/* Toggle Button - Hidden on mobile */}
      <button
        onClick={() => onToggle(!isExpanded)}
        className="hidden lg:block absolute bottom-32 right-0 bg-gray-100 hover:bg-gray-200 rounded-l-lg p-2 shadow-lg transition-colors duration-200"
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Logout Confirmation Dialog */}
      {isMounted && showLogoutDialog && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                  <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  You will be redirected to the login page and will need to sign in again to access the admin dashboard.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logging out...
                    </>
                  ) : (
                    'Log out'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Sidebar;
