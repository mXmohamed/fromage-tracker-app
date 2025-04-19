import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Configuration
const API_URL = 'https://api.fromo-tracker.com'; // À changer avec l'URL de production

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider pour le contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        // Récupérer le token du stockage local
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Pas de token, l'utilisateur n'est pas connecté
          setIsLoading(false);
          return;
        }

        // Configurer l'en-tête d'autorisation par défaut
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Récupérer les informations utilisateur
        const response = await axios.get(`${API_URL}/api/auth/profile`);
        
        // Vérifier que l'utilisateur est un manager
        if (response.data.user.role !== 'manager') {
          // Si ce n'est pas un manager, déconnecter l'utilisateur
          await logout();
          setError('Accès non autorisé. Cette application est réservée aux managers.');
          return;
        }

        // Définir les informations utilisateur
        setUser({
          ...response.data.user,
          token
        });
      } catch (error) {
        console.error('Erreur lors de la vérification de l'authentification:', error);
        
        // Si erreur 401 (non autorisé), supprimer le token
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
        
        setError('Session expirée ou invalide. Veuillez vous reconnecter.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user: userData } = response.data;

      // Vérifier que l'utilisateur est un manager
      if (userData.role !== 'manager') {
        setError('Accès réservé aux managers. Cette application n\'est pas destinée aux commerciaux.');
        setIsLoading(false);
        return false;
      }

      // Sauvegarder le token dans le stockage local
      localStorage.setItem('token', token);

      // Configurer l'en-tête d'autorisation par défaut
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Mettre à jour l'état utilisateur
      setUser({
        ...userData,
        token
      });

      // Notification de succès
      toast.success(`Bienvenue, ${userData.name} !`);
      
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Gérer les différents types d'erreurs
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.status === 400 || error.response.status === 401) {
          setError('Email ou mot de passe incorrect');
          toast.error('Email ou mot de passe incorrect');
        } else {
          setError(`Erreur de connexion (${error.response.status})`);
          toast.error('Erreur lors de la connexion au serveur');
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        setError('Impossible de contacter le serveur');
        toast.error('Impossible de contacter le serveur');
      } else {
        // Autre erreur
        setError('Erreur de connexion');
        toast.error('Une erreur est survenue lors de la connexion');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setIsLoading(true);

    try {
      // Informer le serveur de la déconnexion si l'utilisateur est connecté
      if (user && user.token) {
        await axios.post(`${API_URL}/api/auth/logout`);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Supprimer le token du stockage local
      localStorage.removeItem('token');
      
      // Supprimer l'en-tête d'autorisation
      delete axios.defaults.headers.common['Authorization'];
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      setIsLoading(false);
      
      // Notification de déconnexion
      toast.info('Vous avez été déconnecté');
    }
  };

  // Valeur du contexte
  const value = {
    user,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
