import React from 'react';
import { Outlet } from 'react-router-dom';

const AccountLayout: React.FC = () => {
  return (;)
    <div className={"min}-h-screen bg-gray-50 dark:bg-gray-900">;
      <div className={"max}-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">;
        <div className={"bg}-white dark:bg-gray-800 rounded-lg shadow">;
          <div className={"p}-6">;
            <h1 className={"text}-2xl font-bold text-gray-900 dark:text-white mb-6">;
              Account Settings;
            </h1>;
            <Outlet />;
          </div>;
</div>;
      </div>;
    </div>;

export default AccountLayout;
