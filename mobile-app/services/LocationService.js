import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Configuration
const API_URL = 'https://api.fromo-tracker.com'; // À changer avec l'URL de production
const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_TRACKING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LOCATION_OFFLINE_STORAGE_KEY = 'offline-locations';

// Configuration du gestionnaire de tâches en arrière-plan
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Erreur de localisation en arrière-plan:', error);
    return;
  }
  
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      try {
        // Récupérer le token et l'ID utilisateur
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        
        if (!token || !userId) {
          console.warn('Token ou ID utilisateur manquant, arrêt du suivi de localisation');
          stopLocationTracking();
          return;
        }

        // Vérifier la connectivité Internet
        const netInfo = await NetInfo.fetch();
        
        if (netInfo.isConnected) {
          // Envoyer la position au serveur
          await sendLocationToServer(location, token);
          
          // Vérifier s'il y a des positions stockées hors ligne à envoyer
          await sendOfflineLocations(token);
        } else {
          // Stocker la position localement si hors ligne
          await storeLocationOffline(location, userId);
        }
      } catch (error) {
        console.error('Erreur lors du traitement de la position:', error);
        // Stocker en cas d'erreur
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          await storeLocationOffline(location, userId);
        }
      }
    }
  }
});

/**
 * Envoie la position au serveur
 * @param {Object} location Objet de localisation d'Expo
 * @param {String} token Token d'authentification JWT
 */
const sendLocationToServer = async (location, token) => {
  const { coords, timestamp } = location;
  
  try {
    await axios.post(
      `${API_URL}/api/locations`,
      {
        coordinates: [coords.longitude, coords.latitude],
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        speed: coords.speed,
        timestamp: new Date(timestamp),
        batteryLevel: await getBatteryLevel(),
        metadata: {
          deviceModel: Platform.OS,
          appVersion: '1.0.0',
          networkType: (await NetInfo.fetch()).type
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Position envoyée au serveur:', new Date(timestamp));
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la position au serveur:', error);
    throw error;
  }
};

/**
 * Stocke la position localement en cas de mode hors ligne
 * @param {Object} location Objet de localisation d'Expo
 * @param {String} userId ID de l'utilisateur
 */
const storeLocationOffline = async (location, userId) => {
  try {
    const { coords, timestamp } = location;
    
    // Récupérer les positions stockées
    const storedLocationsJSON = await AsyncStorage.getItem(LOCATION_OFFLINE_STORAGE_KEY);
    const storedLocations = storedLocationsJSON ? JSON.parse(storedLocationsJSON) : [];
    
    // Ajouter la nouvelle position
    storedLocations.push({
      userId,
      coordinates: [coords.longitude, coords.latitude],
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      speed: coords.speed,
      timestamp: new Date(timestamp),
      stored_at: new Date()
    });
    
    // Limiter le nombre de positions stockées (max 100)
    const limitedLocations = storedLocations.slice(-100);
    
    // Sauvegarder les positions
    await AsyncStorage.setItem(LOCATION_OFFLINE_STORAGE_KEY, JSON.stringify(limitedLocations));
    
    console.log('Position stockée localement (hors ligne):', new Date(timestamp));
  } catch (error) {
    console.error('Erreur lors du stockage local de la position:', error);
  }
};

/**
 * Envoie les positions stockées hors ligne au serveur
 * @param {String} token Token d'authentification JWT
 */
const sendOfflineLocations = async (token) => {
  try {
    const storedLocationsJSON = await AsyncStorage.getItem(LOCATION_OFFLINE_STORAGE_KEY);
    
    if (!storedLocationsJSON) return;
    
    const storedLocations = JSON.parse(storedLocationsJSON);
    
    if (storedLocations.length === 0) return;
    
    console.log(`Envoi de ${storedLocations.length} positions stockées hors ligne`);
    
    // Envoyer chaque position
    const promises = storedLocations.map(location => 
      axios.post(
        `${API_URL}/api/locations`,
        {
          coordinates: location.coordinates,
          accuracy: location.accuracy,
          altitude: location.altitude,
          speed: location.speed,
          timestamp: location.timestamp,
          stored_offline: true,
          stored_at: location.stored_at
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      ).catch(error => {
        console.error('Erreur lors de l\'envoi d\'une position stockée:', error);
        return null; // Ne pas faire échouer l'ensemble de Promise.all
      })
    );
    
    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(promises);
    
    // Compter les succès
    const successCount = results.filter(result => result !== null).length;
    
    console.log(`${successCount}/${storedLocations.length} positions hors ligne envoyées avec succès`);
    
    // Vider le stockage local si tout a été envoyé avec succès
    if (successCount === storedLocations.length) {
      await AsyncStorage.removeItem(LOCATION_OFFLINE_STORAGE_KEY);
    } else {
      // Sinon, ne conserver que les positions qui n'ont pas pu être envoyées
      const failedIndexes = results.map((result, index) => result === null ? index : -1).filter(index => index !== -1);
      const remainingLocations = failedIndexes.map(index => storedLocations[index]);
      await AsyncStorage.setItem(LOCATION_OFFLINE_STORAGE_KEY, JSON.stringify(remainingLocations));
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des positions stockées hors ligne:', error);
  }
};

/**
 * Récupérer le niveau de batterie (simulé)
 */
const getBatteryLevel = async () => {
  // Dans une vraie app, on utiliserait expo-battery
  return Math.floor(Math.random() * 100);
};

/**
 * Démarre le suivi de localisation en arrière-plan
 * @param {String} userId ID de l'utilisateur pour le suivi
 */
export const startLocationTracking = async (userId) => {
  try {
    // Demander les permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.error('Permission de localisation en premier plan refusée');
      return false;
    }
    
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.error('Permission de localisation en arrière-plan refusée');
      return false;
    }
    
    // Sauvegarder l'ID de l'utilisateur
    await AsyncStorage.setItem('userId', userId);
    
    // Démarrer le suivi en arrière-plan
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_TRACKING_INTERVAL,
      distanceInterval: 100, // 100 mètres minimum entre les mises à jour
      foregroundService: {
        notificationTitle: 'Suivi de localisation FroMo',
        notificationBody: 'Votre position est suivie pour le service commercial',
        notificationColor: '#2563eb'
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Other,
      showsBackgroundLocationIndicator: true
    });
    
    console.log('Suivi de localisation démarré pour l\'utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('Erreur lors du démarrage du suivi de localisation:', error);
    return false;
  }
};

/**
 * Arrête le suivi de localisation en arrière-plan
 */
export const stopLocationTracking = async () => {
  try {
    const isTaskDefined = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    
    if (isTaskDefined) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Suivi de localisation arrêté');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'arrêt du suivi de localisation:', error);
    return false;
  }
};

/**
 * Récupère la position actuelle une seule fois
 */
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    return location;
  } catch (error) {
    console.error('Erreur lors de la récupération de la position actuelle:', error);
    throw error;
  }
};
