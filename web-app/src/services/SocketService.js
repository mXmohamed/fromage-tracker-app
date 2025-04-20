import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Utiliser la variable d'environnement

// Socket.io singleton
let socket = null;

/**
 * Initialise la connexion socket
 * @param {string} token - Token d'authentification
 * @returns {object} - Instance socket.io
 */
export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  // Créer une nouvelle connexion
  socket = io(API_URL, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
  });

  // Événements de connexion
  socket.on('connect', () => {
    console.log('Socket.io connecté');
  });

  socket.on('connect_error', (error) => {
    console.error('Erreur de connexion socket:', error.message);
    toast.error('Problème de connexion aux mises à jour en temps réel');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.io déconnecté:', reason);
    if (reason === 'io server disconnect') {
      // Déconnecté par le serveur, reconnexion manuelle
      socket.connect();
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Socket.io reconnecté après ${attemptNumber} tentatives`);
    toast.success('Reconnecté aux mises à jour en temps réel');
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket.io échec de reconnexion après toutes les tentatives');
    toast.error('Impossible de se reconnecter aux mises à jour en temps réel');
  });

  return socket;
};

/**
 * S'abonne à un événement socket.io
 * @param {string} event - Nom de l'événement
 * @param {function} callback - Fonction de rappel
 * @returns {function} - Fonction pour se désabonner
 */
export const subscribeToEvent = (event, callback) => {
  if (!socket) {
    console.error('Socket.io non initialisé. Veuillez appeler initializeSocket() d\'abord');
    return () => {};
  }

  socket.on(event, callback);

  // Retourner une fonction pour se désabonner
  return () => {
    socket.off(event, callback);
  };
};

/**
 * Émet un événement via socket.io
 * @param {string} event - Nom de l'événement
 * @param {any} data - Données à envoyer
 * @returns {Promise} - Promesse résolue/rejetée en fonction de la réponse
 */
export const emitEvent = (event, data) => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket.io non initialisé. Veuillez appeler initializeSocket() d\'abord'));
      return;
    }

    socket.emit(event, data, (response) => {
      if (response && response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
};

export default {
  initializeSocket,
  subscribeToEvent,
  emitEvent
};