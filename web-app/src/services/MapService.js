import axios from 'axios';

// Configuration
const API_URL = 'https://api.fromo-tracker.com'; // À changer avec l'URL de production

/**
 * Service pour la gestion des cartes et de la géolocalisation
 */
class MapService {
  /**
   * Récupérer toutes les dernières positions des commerciaux
   * @returns {Promise<Array>} Liste des commerciaux avec leur position
   */
  static async getAllLastLocations() {
    try {
      const response = await axios.get(`${API_URL}/api/locations/all`);
      return response.data.users;
    } catch (error) {
      console.error('Erreur lors de la récupération des positions:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des positions d'un commercial
   * @param {String} userId ID du commercial
   * @param {Object} options Options de filtrage (startDate, endDate, limit, page)
   * @returns {Promise<Object>} Historique des positions
   */
  static async getLocationHistory(userId, options = {}) {
    try {
      const { startDate, endDate, limit = 100, page = 1 } = options;
      
      const params = {
        limit,
        page
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_URL}/api/locations/user/${userId}/history`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des positions:', error);
      throw error;
    }
  }

  /**
   * Récupérer les commerciaux à proximité d'un point
   * @param {Number} latitude Latitude
   * @param {Number} longitude Longitude
   * @param {Number} maxDistance Distance maximum en mètres (défaut: 5000m)
   * @returns {Promise<Array>} Liste des commerciaux à proximité
   */
  static async findNearbyUsers(latitude, longitude, maxDistance = 5000) {
    try {
      const params = {
        latitude,
        longitude,
        maxDistance
      };

      const response = await axios.get(`${API_URL}/api/locations/nearby`, { params });
      return response.data.users;
    } catch (error) {
      console.error('Erreur lors de la recherche des commerciaux à proximité:', error);
      throw error;
    }
  }

  /**
   * Récupérer les clients à proximité d'un point
   * @param {Number} latitude Latitude
   * @param {Number} longitude Longitude
   * @param {Number} radius Rayon en mètres (défaut: 5000m)
   * @returns {Promise<Array>} Liste des clients à proximité
   */
  static async findNearbyClients(latitude, longitude, radius = 5000) {
    try {
      const params = {
        latitude,
        longitude,
        radius
      };

      const response = await axios.get(`${API_URL}/api/clients/nearby`, { params });
      return response.data.clients;
    } catch (error) {
      console.error('Erreur lors de la recherche des clients à proximité:', error);
      throw error;
    }
  }

  /**
   * Calculer l'itinéraire entre deux points
   * @param {Array} origin Coordonnées d'origine [lat, lng]
   * @param {Array} destination Coordonnées de destination [lat, lng]
   * @param {String} mode Mode de transport (driving, walking, bicycling, transit)
   * @returns {Promise<Object>} Itinéraire
   */
  static async getDirections(origin, destination, mode = 'driving') {
    try {
      // Note: Nécessite une clé API Google ou un service similaire
      // Ici nous simulons une réponse pour l'exemple
      console.warn('Cette méthode est une simulation et nécessite une implémentation réelle avec un service comme l\'API Google Maps');
      
      // Simuler une réponse
      return {
        distance: {
          text: '5.2 km',
          value: 5200
        },
        duration: {
          text: '12 min',
          value: 720
        },
        steps: [
          {
            distance: { text: '2.1 km', value: 2100 },
            duration: { text: '5 min', value: 300 },
            instructions: 'Prenez la direction nord sur Avenue des Fromages',
            start_location: origin,
            end_location: [origin[0] + 0.01, origin[1] + 0.01]
          },
          {
            distance: { text: '3.1 km', value: 3100 },
            duration: { text: '7 min', value: 420 },
            instructions: 'Tournez à droite sur Boulevard Camembert',
            start_location: [origin[0] + 0.01, origin[1] + 0.01],
            end_location: destination
          }
        ]
      };
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      throw error;
    }
  }

  /**
   * Géocoder une adresse en coordonnées
   * @param {String} address Adresse à géocoder
   * @returns {Promise<Object>} Coordonnées de l'adresse
   */
  static async geocodeAddress(address) {
    try {
      // Note: Nécessite une clé API Google ou un service similaire
      console.warn('Cette méthode est une simulation et nécessite une implémentation réelle avec un service comme l\'API Google Maps');
      
      // Simuler une réponse pour Paris
      return {
        formatted_address: address,
        geometry: {
          location: {
            lat: 48.856614,
            lng: 2.3522219
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors du géocodage de l\'adresse:', error);
      throw error;
    }
  }

  /**
   * Géocoder inversé - convertir des coordonnées en adresse
   * @param {Number} latitude Latitude
   * @param {Number} longitude Longitude
   * @returns {Promise<Object>} Adresse des coordonnées
   */
  static async reverseGeocode(latitude, longitude) {
    try {
      // Note: Nécessite une clé API Google ou un service similaire
      console.warn('Cette méthode est une simulation et nécessite une implémentation réelle avec un service comme l\'API Google Maps');
      
      // Simuler une réponse
      return {
        formatted_address: '42 Rue du Fromage, 75010 Paris, France',
        address_components: [
          { long_name: '42', short_name: '42', types: ['street_number'] },
          { long_name: 'Rue du Fromage', short_name: 'Rue du Fromage', types: ['route'] },
          { long_name: 'Paris', short_name: 'Paris', types: ['locality', 'political'] },
          { long_name: '75010', short_name: '75010', types: ['postal_code'] },
          { long_name: 'France', short_name: 'FR', types: ['country', 'political'] }
        ]
      };
    } catch (error) {
      console.error('Erreur lors du géocodage inversé:', error);
      throw error;
    }
  }

  /**
   * Obtenir des couleurs uniques pour chaque commercial sur la carte
   * @param {Number} count Nombre de couleurs à générer
   * @returns {Array<String>} Liste de couleurs au format hexadécimal
   */
  static getUniqueColors(count) {
    const colors = [
      '#2563eb', // blue-600
      '#16a34a', // green-600
      '#dc2626', // red-600
      '#9333ea', // purple-600
      '#f59e0b', // amber-500
      '#0891b2', // cyan-600
      '#84cc16', // lime-500
      '#c026d3', // fuchsia-600
      '#f97316', // orange-500
      '#4f46e5'  // indigo-600
    ];

    // Si moins de couleurs que dans notre palette
    if (count <= colors.length) {
      return colors.slice(0, count);
    }

    // Sinon, générer des couleurs supplémentaires
    const additionalColors = [];
    for (let i = 0; i < count - colors.length; i++) {
      const hue = Math.floor(360 * i / (count - colors.length));
      additionalColors.push(`hsl(${hue}, 70%, 50%)`);
    }

    return [...colors, ...additionalColors];
  }

  /**
   * Calculer la distance entre deux points géographiques (formule de Haversine)
   * @param {Array} point1 Premier point [lat, lng]
   * @param {Array} point2 Second point [lat, lng]
   * @returns {Number} Distance en mètres
   */
  static calculateDistance(point1, point2) {
    const toRad = value => (value * Math.PI) / 180;
    const R = 6371e3; // Rayon de la Terre en mètres
    
    const lat1 = point1[0];
    const lon1 = point1[1];
    const lat2 = point2[0];
    const lon2 = point2[1];

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // en mètres
  }
}

export default MapService;
