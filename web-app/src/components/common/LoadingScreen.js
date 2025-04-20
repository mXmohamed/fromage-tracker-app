import React from 'react';
import { FiCheese } from 'react-icons/fi';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-bounce mb-4">
        <FiCheese className="h-16 w-16 text-yellow-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chargement en cours...</h2>
      <p className="text-gray-600">Veuillez patienter</p>
      <div className="mt-6 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;