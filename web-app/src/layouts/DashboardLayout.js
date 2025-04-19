import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icônes 
import { 
  FiPieChart, 
  FiMap, 
  FiShoppingCart, 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiUser, 
  FiChevronDown, 
  FiBell,
  FiShoppingBag,
  FiMapPin
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Liens de la sidebar
  const sidebarLinks = [
    { 
      path: '/dashboard', 
      name: 'Tableau de bord', 
      icon: <FiPieChart size={20} /> 
    },
    { 
      path: '/map', 
      name: 'Carte commerciaux', 
      icon: <FiMap size={20} /> 
    },
    { 
      path: '/sales', 
      name: 'Ventes', 
      icon: <FiShoppingCart size={20} /> 
    },
    { 
      path: '/team', 
      name: 'Équipe', 
      icon: <FiUsers size={20} /> 
    },
    { 
      path: '/products', 
      name: 'Produits', 
      icon: <FiShoppingBag size={20} /> 
    },
    { 
      path: '/clients', 
      name: 'Clients', 
      icon: <FiMapPin size={20} /> 
    },
    { 
      path: '/settings', 
      name: 'Paramètres', 
      icon: <FiSettings size={20} /> 
    },
  ];

  // Liste des notifications (simulée)
  const notifications = [
    {
      id: 1,
      title: 'Nouvelle vente',
      message: 'Sophie Martin a enregistré une vente de 450€',
      time: 'Il y a 25 min',
      read: false
    },
    {
      id: 2,
      title: 'Visite client',
      message: 'Thomas Bernard a visité Fromagerie Dupont',
      time: 'Il y a 1h',
      read: true
    },
    {
      id: 3,
      title: 'Stock faible',
      message: 'Le stock de Comté 18 mois est faible',
      time: 'Il y a 2h',
      read: true
    }
  ];

  // Nombre de notifications non lues
  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-blue-800 text-white lg:w-64 ${menuOpen ? 'w-64' : 'w-0 lg:w-64'} 
                    transition-all duration-300 fixed lg:relative h-full z-20 overflow-hidden`}
      >
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">FroMo Manager</h1>
        </div>
        
        <nav className="mt-6">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center w-full p-4 transition-colors duration-200 ${
                location.pathname === link.path ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <span className="mr-4">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <button 
            className="flex items-center text-white opacity-75 hover:opacity-100"
            onClick={handleLogout}
          >
            <FiLogOut size={20} className="mr-3" />
            Déconnexion
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="lg:hidden text-gray-600 focus:outline-none"
              >
                {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {sidebarLinks.find(link => link.path === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="text-gray-500 relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <FiBell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                
                {/* Dropdown Notifications */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        <span className="text-xs text-blue-600 cursor-pointer">Marquer tout comme lu</span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="py-2 px-3 bg-gray-100 text-xs text-center text-gray-600 border-t border-gray-200">
                      Voir toutes les notifications
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user?.name?.charAt(0) || 'M'}
                  </div>
                  <span className="hidden md:inline-block font-medium">{user?.name || 'Manager'}</span>
                  <FiChevronDown size={16} className="text-gray-500" />
                </button>
                
                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiUser className="inline mr-2" />
                        Mon Profil
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiSettings className="inline mr-2" />
                        Paramètres
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLogOut className="inline mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
