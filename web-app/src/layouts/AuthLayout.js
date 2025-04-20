import React from 'react';
import { FiCheese } from 'react-icons/fi';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <FiCheese className="h-12 w-12 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Fromage Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Application de suivi géographique pour commerciaux de fromages
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;