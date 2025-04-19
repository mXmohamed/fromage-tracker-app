import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Alert, Platform, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocation } from '../services/LocationService';
import axios from 'axios';
import { Camera, MapPin, Navigation } from 'react-native-feather';

// Configuration
const API_URL = 'https://api.fromo-tracker.com'; // À changer avec l'URL de production

const MapScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [region, setRegion] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const mapRef = useRef(null);

  // Charger la carte et les clients à proximité
  useEffect(() => {
    const loadMapData = async () => {
      try {
        // Obtenir la localisation actuelle
        const location = await getCurrentLocation();
        const { latitude, longitude } = location.coords;

        // Définir la région de la carte
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        // Charger les clients à proximité
        await loadNearbyClients(latitude, longitude);
      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
        setErrorMsg('Impossible d\'accéder à votre position');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Charger les clients à proximité
  const loadNearbyClients = async (latitude, longitude, radius = 5000) => {
    try {
      const response = await axios.get(`${API_URL}/api/clients/nearby`, {
        params: {
          latitude,
          longitude,
          radius // 5km par défaut
        }
      });

      setClients(response.data.clients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setErrorMsg('Impossible de charger les clients à proximité');
    }
  };

  // Enregistrer une visite chez un client
  const checkInAtClient = async (clientId) => {
    try {
      // Vérifier si on a un client sélectionné
      if (!clientId) {
        Alert.alert('Erreur', 'Aucun client sélectionné');
        return;
      }

      // Obtenir la position actuelle
      const location = await getCurrentLocation();
      const { latitude, longitude } = location.coords;

      // Envoyer la requête de check-in
      const response = await axios.post(`${API_URL}/api/visits`, {
        client: clientId,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        status: 'in-progress'
      });

      // Naviguer vers l'écran de détail de visite
      navigation.navigate('VisitDetail', {
        visitId: response.data.visit._id,
        clientId: clientId
      });
    } catch (error) {
      console.error('Erreur lors du check-in:', error);
      Alert.alert(
        'Erreur', 
        'Impossible d\'enregistrer votre visite. Veuillez réessayer.'
      );
    }
  };

  // Centrer la carte sur la position actuelle
  const centerMapOnCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      const { latitude, longitude } = location.coords;

      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à votre position');
    }
  };

  // Ouvrir la navigation vers un client
  const navigateToClient = (client) => {
    const { location } = client;
    const latitude = location.coordinates[1];
    const longitude = location.coordinates[0];
    const label = client.name;

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.replace('Map')}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Carte */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
      >
        {/* Marqueurs pour les clients */}
        {clients.map(client => (
          <Marker
            key={client._id}
            coordinate={{
              latitude: client.location.coordinates[1],
              longitude: client.location.coordinates[0]
            }}
            title={client.name}
            description={client.address.street}
            pinColor="#FF9800" // Orange pour les clients
            onPress={() => setSelectedClient(client)}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{client.name}</Text>
                <Text style={styles.calloutAddress}>
                  {client.address.street}, {client.address.postalCode} {client.address.city}
                </Text>
                <Text style={styles.calloutType}>{client.type}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bouton de centrage sur la position actuelle */}
      <TouchableOpacity 
        style={styles.centerButton}
        onPress={centerMapOnCurrentLocation}
      >
        <Navigation stroke="#fff" width={24} height={24} />
      </TouchableOpacity>

      {/* Panneau d'information client et actions */}
      {selectedClient && (
        <View style={styles.clientPanel}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{selectedClient.name}</Text>
            <Text style={styles.clientAddress}>
              {selectedClient.address.street}, {selectedClient.address.postalCode} {selectedClient.address.city}
            </Text>
            <Text style={styles.clientType}>{selectedClient.type}</Text>
          </View>
          <View style={styles.clientActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => checkInAtClient(selectedClient._id)}
            >
              <Camera stroke="#fff" width={20} height={20} />
              <Text style={styles.actionButtonText}>Check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.navigationButton]}
              onPress={() => navigateToClient(selectedClient)}
            >
              <MapPin stroke="#fff" width={20} height={20} />
              <Text style={styles.actionButtonText}>Itinéraire</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    backgroundColor: '#2563eb',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  calloutContainer: {
    width: 200,
    padding: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  calloutType: {
    fontSize: 11,
    color: '#888',
  },
  clientPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  clientInfo: {
    marginBottom: 15,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clientAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  clientType: {
    fontSize: 13,
    color: '#888',
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  navigationButton: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MapScreen;
