import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Chargement...</h2>
        <p className="text-gray-500">Veuillez patienter pendant le chargement de l'application</p>
      </div>
    </div>
  );
};

export default LoadingScreen;