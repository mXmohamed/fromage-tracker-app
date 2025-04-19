import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MapPage from './pages/map/MapPage';
import SalesPage from './pages/sales/SalesPage';
import TeamPage from './pages/team/TeamPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProductsPage from './pages/products/ProductsPage';
import ClientsPage from './pages/clients/ClientsPage';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Services
import { initializeSocket } from './services/SocketService';

// Composants
import LoadingScreen from './components/common/LoadingScreen';

// Routes protégées
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier que l'utilisateur est un manager
  if (user.role !== 'manager') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Routes publiques (accessibles uniquement si non connecté)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App principal
const AppContent = () => {
  const { user } = useAuth();

  // Initialiser le socket.io pour les mises à jour en temps réel
  useEffect(() => {
    if (user) {
      // Initialiser la connexion socket
      const socket = initializeSocket(user.token);

      // Nettoyage
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        } />

        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/map" element={
          <PrivateRoute>
            <DashboardLayout>
              <MapPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/sales" element={
          <PrivateRoute>
            <DashboardLayout>
              <SalesPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/team" element={
          <PrivateRoute>
            <DashboardLayout>
              <TeamPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/products" element={
          <PrivateRoute>
            <DashboardLayout>
              <ProductsPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/clients" element={
          <PrivateRoute>
            <DashboardLayout>
              <ClientsPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/settings" element={
          <PrivateRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
};

// App avec contexte d'authentification
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
