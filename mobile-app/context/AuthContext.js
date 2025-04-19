import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
    const loadUser = async () => {
      setIsLoading(true);

      try {
        // Récupérer le token et les informations utilisateur depuis le stockage
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');

        if (token && userData) {
          // Configurer l'en-tête d'autorisation par défaut pour toutes les requêtes
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          setUser(JSON.parse(userData));
          
          // Optionnel : Valider le token côté serveur
          try {
            await axios.get(`${API_URL}/api/auth/profile`);
          } catch (error) {
            // Si le token est invalide, déconnecter l'utilisateur
            if (error.response && error.response.status === 401) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        setError('Impossible de restaurer la session');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
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

      const { token, user } = response.data;

      // Vérifier que l'utilisateur est un commercial
      if (user.role !== 'commercial') {
        setError('Accès réservé aux commerciaux');
        setIsLoading(false);
        return false;
      }

      // Stocker les informations
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userId', user.id.toString());

      // Configurer l'en-tête d'autorisation par défaut
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      if (error.response) {
        // Erreur avec réponse du serveur
        if (error.response.status === 400 || error.response.status === 401) {
          setError('Email ou mot de passe incorrect');
        } else {
          setError(`Erreur de connexion (${error.response.status})`);
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        setError('Impossible de contacter le serveur');
      } else {
        // Autre erreur
        setError('Erreur de connexion');
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
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        // Informer le serveur de la déconnexion
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Supprimer les données locales
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userId');
      
      // Supprimer l'en-tête d'autorisation
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour le profil
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, profileData);
      
      // Mettre à jour les données utilisateur locales
      const updatedUser = response.data.user;
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError('Impossible de mettre à jour le profil');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
