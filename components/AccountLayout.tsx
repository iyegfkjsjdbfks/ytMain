import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Cog8ToothIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * AccountLayout component provides a consistent layout for account-related pages
 * with navigation sidebar and content area.
 */
const AccountLayout: React.FC = () => {
  const location = useLocation();

  const accountNavItems = [
    {
      path: '/account/settings',
      label: 'General Settings',
      icon: Cog8ToothIcon,
      description: 'Manage your account preferences'
    },
    {
      path: '/account/privacy',
      label: 'Privacy & Security',
      icon: ShieldCheckIcon,
      description: 'Control your privacy settings'
    },
    {
      path: '/account/data',
      label: 'Your Data',
      icon: DocumentTextIcon,
      description: 'Download and manage your data'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <UserCircleIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <ul className="space-y-2">
                {accountNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Handle account backup
                    console.log('Initiating account backup...');
                  }}
                  className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Download account data
                </button>
                <button
                  onClick={() => {
                    // Handle password change
                    console.log('Redirecting to password change...');
                  }}
                  className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Change password
                </button>
                <button
                  onClick={() => {
                    // Handle two-factor auth
                    console.log('Setting up 2FA...');
                  }}
                  className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
