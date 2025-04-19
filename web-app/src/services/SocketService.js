import { io } from 'socket.io-client';

// Configuration
const API_URL = 'https://api.fromo-tracker.com'; // À changer avec l'URL de production

// Instance de socket.io
let socket = null;

// Liste des callbacks pour les événements
const eventCallbacks = {
  position_updated: [],
  visit_started: [],
  visit_completed: [],
  new_sale: []
};

/**
 * Initialiser la connexion socket
 * @param {String} token Token d'authentification JWT
 * @returns {Object} Instance socket.io
 */
export const initializeSocket = (token) => {
  if (socket) {
    // Déconnecter l'ancienne instance
    socket.disconnect();
  }

  // Créer une nouvelle connexion
  socket = io(API_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  // Écouter les événements de connexion
  socket.on('connect', () => {
    console.log('Connexion socket.io établie');
  });

  socket.on('disconnect', (reason) => {
    console.log(`Déconnexion socket.io: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error('Erreur socket.io:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnexion socket.io réussie après ${attemptNumber} tentatives`);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Tentative de reconnexion socket.io #${attemptNumber}`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Erreur de reconnexion socket.io:', error);
  });

  // Écouter les mises à jour de position
  socket.on('position_updated', (data) => {
    console.log('Position mise à jour:', data);
    notifyCallbacks('position_updated', data);
  });

  // Écouter le début des visites
  socket.on('visit_started', (data) => {
    console.log('Visite démarrée:', data);
    notifyCallbacks('visit_started', data);
  });

  // Écouter la fin des visites
  socket.on('visit_completed', (data) => {
    console.log('Visite terminée:', data);
    notifyCallbacks('visit_completed', data);
  });

  // Écouter les nouvelles ventes
  socket.on('new_sale', (data) => {
    console.log('Nouvelle vente:', data);
    notifyCallbacks('new_sale', data);
  });

  return socket;
};

/**
 * Notifier tous les callbacks enregistrés pour un événement
 * @param {String} event Nom de l'événement
 * @param {Object} data Données de l'événement
 */
const notifyCallbacks = (event, data) => {
  if (eventCallbacks[event]) {
    eventCallbacks[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erreur dans le callback de l'événement ${event}:`, error);
      }
    });
  }
};

/**
 * S'abonner à un événement
 * @param {String} event Nom de l'événement
 * @param {Function} callback Fonction de callback
 * @returns {Function} Fonction pour se désabonner
 */
export const subscribeToEvent = (event, callback) => {
  if (!eventCallbacks[event]) {
    eventCallbacks[event] = [];
  }

  eventCallbacks[event].push(callback);

  // Retourner une fonction pour se désabonner
  return () => {
    if (eventCallbacks[event]) {
      const index = eventCallbacks[event].indexOf(callback);
      if (index !== -1) {
        eventCallbacks[event].splice(index, 1);
      }
    }
  };
};

/**
 * Obtenir l'instance socket.io
 * @returns {Object|null} Instance socket.io ou null si non initialisé
 */
export const getSocket = () => socket;

/**
 * Déconnecter le socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Nettoyer les callbacks
  Object.keys(eventCallbacks).forEach(event => {
    eventCallbacks[event] = [];
  });
};

/**
 * Envoyer un événement au serveur
 * @param {String} event Nom de l'événement
 * @param {Object} data Données à envoyer
 * @returns {Boolean} Succès de l'envoi
 */
export const emitEvent = (event, data) => {
  if (!socket || !socket.connected) {
    console.error('Socket non connecté, impossible d\'envoyer l\'événement');
    return false;
  }

  socket.emit(event, data);
  return true;
};
