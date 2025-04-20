import axios from 'axios';

// Configuration
const API_URL = 'https://api.fromo-tracker.com'; // À changer avec l'URL de production

/**
 * Récupère les dernières positions de tous les commerciaux
 * @returns {Promise<Array>} - Liste des commerciaux avec leurs positions
 */
const getAllLastLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/locations/all`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des positions:', error);
    throw error;
  }
};

/**
 * Récupère l'historique des positions d'un commercial
 * @param {string} userId - ID du commercial
 * @param {object} options - Options de filtrage
 * @returns {Promise<Array>} - Historique des positions
 */
const getUserLocationHistory = async (userId, options = {}) => {
  try {
    const { startDate, endDate, limit } = options;
    const params = { startDate, endDate, limit };
    
    const response = await axios.get(`${API_URL}/api/locations/history/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
};

/**
 * Recherche des clients à proximité d'un point
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Rayon en mètres
 * @returns {Promise<Array>} - Liste des clients à proximité
 */
const findNearbyClients = async (lat, lng, radius = 5000) => {
  try {
    const response = await axios.get(`${API_URL}/api/clients/nearby`, {
      params: { lat, lng, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de clients à proximité:', error);
    throw error;
  }
};

/**
 * Récupère les itinéraires visités par un commercial
 * @param {string} userId - ID du commercial
 * @param {string} date - Date au format YYYY-MM-DD
 * @returns {Promise<Array>} - Liste des points de l'itinéraire
 */
const getUserRoutes = async (userId, date) => {
  try {
    const response = await axios.get(`${API_URL}/api/routes/${userId}`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des itinéraires:', error);
    throw error;
  }
};

/**
 * Génère des couleurs uniques pour différencier les utilisateurs
 * @param {number} count - Nombre de couleurs à générer
 * @returns {Array<string>} - Liste de couleurs au format hexadécimal
 */
const getUniqueColors = (count) => {
  // Couleurs prédéfinies pour un petit nombre d'utilisateurs
  const predefinedColors = [
    '#2563eb', // Bleu
    '#dc2626', // Rouge
    '#16a34a', // Vert
    '#ea580c', // Orange
    '#8b5cf6', // Violet
    '#db2777', // Rose
    '#0891b2', // Cyan
    '#a16207', // Ambre
    '#4f46e5', // Indigo
    '#059669'  // Émeraude
  ];

  if (count <= predefinedColors.length) {
    return predefinedColors.slice(0, count);
  }

  // Si plus de couleurs sont nécessaires, en générer aléatoirement
  const colors = [...predefinedColors];
  for (let i = predefinedColors.length; i < count; i++) {
    const hue = Math.floor(Math.random() * 360);
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};

export default {
  getAllLastLocations,
  getUserLocationHistory,
  findNearbyClients,
  getUserRoutes,
  getUniqueColors
};