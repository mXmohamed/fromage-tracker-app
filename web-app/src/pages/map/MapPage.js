import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiPlus, FiMinus, FiFilter, FiClock, FiUser, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

// Services
import MapService from '../../services/MapService';
import { subscribeToEvent } from '../../services/SocketService';

// Hack pour corriger les icônes de Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Styles personnalisés
import './MapPage.css';

// Composant pour centrer la carte sur un point
const CenterMap = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);
  
  return null;
};

// Réparer les icônes par défaut de Leaflet
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerRetina,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};

// Créer des icônes personnalisées pour les commerciaux et les clients
const createCustomIcon = (color, type = 'commercial') => {
  return new L.DivIcon({
    className: `custom-map-marker ${type}`,
    html: `<div style="background-color: ${color}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Formatage de la date et l'heure
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const MapPage = () => {
  // État
  const [commerciaux, setCommerciaux] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [center, setCenter] = useState([48.856614, 2.3522219]); // Paris par défaut
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClients, setShowClients] = useState(true);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [mapZoom, setMapZoom] = useState(12);
  const [colorMap, setColorMap] = useState({});
  
  const mapRef = useRef(null);

  // Initialiser les icônes de Leaflet
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les positions des commerciaux
        const users = await MapService.getAllLastLocations();
        setCommerciaux(users);
        
        // Générer une couleur pour chaque commercial
        const colors = MapService.getUniqueColors(users.length);
        const colorMapping = {};
        users.forEach((user, index) => {
          colorMapping[user._id] = colors[index % colors.length];
        });
        setColorMap(colorMapping);
        
        // Charger les clients (simulé pour l'exemple)
        const nearbyClients = await MapService.findNearbyClients(center[0], center[1], 10000);
        setClients(nearbyClients);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement de la carte:', err);
        setError('Impossible de charger les données de la carte');
        setLoading(false);
        toast.error('Erreur lors du chargement des données de la carte');
      }
    };
    
    loadData();
  }, []);

  // S'abonner aux mises à jour de position en temps réel
  useEffect(() => {
    const unsubscribe = subscribeToEvent('position_updated', (data) => {
      setCommerciaux(prev => {
        // Trouver l'utilisateur à mettre à jour
        const index = prev.findIndex(user => user._id === data.userId);
        
        if (index === -1) {
          // Utilisateur non trouvé, aller chercher ses informations complètes
          // Pour l'exemple, nous ajoutons un nouvel utilisateur avec des données minimales
          return [...prev, {
            _id: data.userId,
            name: data.name || 'Utilisateur',
            lastLocation: {
              lat: data.coordinates[1],
              lng: data.coordinates[0],
              timestamp: data.timestamp
            },
            status: 'online'
          }];
        }
        
        // Mettre à jour l'utilisateur existant
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          lastLocation: {
            lat: data.coordinates[1],
            lng: data.coordinates[0],
            timestamp: data.timestamp
          }
        };
        
        return updated;
      });
      
      toast.info(`Position de ${data.name} mise à jour`);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Filtrer les commerciaux en fonction du filtre de temps
  const filteredCommerciaux = commerciaux.filter(commercial => {
    if (selectedTimeFilter === 'all') return true;
    
    const lastUpdate = new Date(commercial.lastLocation?.timestamp);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    
    switch (selectedTimeFilter) {
      case '15min':
        return diffMinutes <= 15;
      case '1h':
        return diffMinutes <= 60;
      case '3h':
        return diffMinutes <= 180;
      case 'today':
        return lastUpdate.toDateString() === now.toDateString();
      default:
        return true;
    }
  });

  // Rafraîchir les données de la carte
  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Recharger les positions des commerciaux
      const users = await MapService.getAllLastLocations();
      setCommerciaux(users);
      
      // Recharger les clients autour du centre actuel
      if (mapRef.current) {
        const mapCenter = mapRef.current.getCenter();
        const nearbyClients = await MapService.findNearbyClients(mapCenter.lat, mapCenter.lng, 10000);
        setClients(nearbyClients);
      }
      
      setLoading(false);
      toast.success('Données de la carte mises à jour');
    } catch (err) {
      console.error('Erreur lors du rafraîchissement de la carte:', err);
      setError('Impossible de rafraîchir les données de la carte');
      setLoading(false);
      toast.error('Erreur lors du rafraîchissement des données');
    }
  };

  // Gérer le zoom de la carte
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setMapZoom(mapRef.current.getZoom());
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setMapZoom(mapRef.current.getZoom());
    }
  };

  // Centrer sur un commercial
  const centerOnUser = (user) => {
    if (user && user.lastLocation) {
      setCenter([user.lastLocation.lat, user.lastLocation.lng]);
      setSelectedUser(user);
    }
  };

  return (
    <div className="h-full relative">
      {/* Carte */}
      <div className="h-full w-full">
        <MapContainer
          center={center}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Centre la carte lorsque la position change */}
          <CenterMap position={center} />
          
          {/* Marqueurs pour les commerciaux */}
          {filteredCommerciaux.map(commercial => (
            commercial.lastLocation && (
              <Marker
                key={commercial._id}
                position={[commercial.lastLocation.lat, commercial.lastLocation.lng]}
                icon={createCustomIcon(colorMap[commercial._id] || '#2563eb', 'commercial')}
                eventHandlers={{
                  click: () => setSelectedUser(commercial)
                }}
              >
                <Popup>
                  <div className="commercial-popup">
                    <h3 className="font-bold text-lg">{commercial.name}</h3>
                    <div className="flex items-center my-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        commercial.status === 'online' ? 'bg-green-500' : 
                        commercial.status === 'visiting' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm">
                        {commercial.status === 'online' ? 'En ligne' : 
                         commercial.status === 'visiting' ? 'En visite' : 
                         commercial.status === 'traveling' ? 'En déplacement' : 'Hors ligne'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <FiClock className="inline mr-1" />
                      Dernière mise à jour: {formatDateTime(commercial.lastLocation.timestamp)}
                    </p>
                    <button
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      onClick={() => centerOnUser(commercial)}
                    >
                      Détails
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          
          {/* Marqueurs pour les clients si activés */}
          {showClients && clients.map(client => (
            <Marker
              key={client._id}
              position={[client.location.coordinates[1], client.location.coordinates[0]]}
              icon={createCustomIcon('#f97316', 'client')}
            >
              <Popup>
                <div className="client-popup">
                  <h3 className="font-bold text-lg">{client.name}</h3>
                  <p className="text-sm text-gray-600">
                    <FiMapPin className="inline mr-1" />
                    {client.address.street}, {client.address.postalCode} {client.address.city}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      {client.type}
                    </span>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={handleRefresh}
          disabled={loading}
          title="Rafraîchir"
        >
          <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
        </button>
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={handleZoomIn}
          title="Zoom avant"
        >
          <FiPlus size={20} />
        </button>
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={handleZoomOut}
          title="Zoom arrière"
        >
          <FiMinus size={20} />
        </button>
      </div>
      
      {/* Filtres */}
      <div className="absolute top-4 left-4 bg-white shadow-md rounded-lg p-4 max-w-xs">
        <div className="flex items-center">
          <FiFilter className="mr-2" />
          <h3 className="font-semibold">Filtres</h3>
        </div>
        
        <div className="mt-3">
          <label className="text-sm font-medium">Période</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              className={`py-1 px-2 text-sm rounded ${
                selectedTimeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedTimeFilter('all')}
            >
              Tous
            </button>
            <button
              className={`py-1 px-2 text-sm rounded ${
                selectedTimeFilter === '15min' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedTimeFilter('15min')}
            >
              15 min
            </button>
            <button
              className={`py-1 px-2 text-sm rounded ${
                selectedTimeFilter === '1h' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedTimeFilter('1h')}
            >
              1 heure
            </button>
            <button
              className={`py-1 px-2 text-sm rounded ${
                selectedTimeFilter === '3h' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedTimeFilter('3h')}
            >
              3 heures
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              checked={showClients}
              onChange={() => setShowClients(!showClients)}
            />
            <span className="ml-2 text-sm">Afficher les clients</span>
          </label>
        </div>
        
        <div className="mt-3">
          <label className="text-sm font-medium">Commerciaux ({filteredCommerciaux.length})</label>
          <div className="mt-1 max-h-48 overflow-y-auto">
            {commerciaux.map(commercial => (
              <div 
                key={commercial._id}
                className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => centerOnUser(commercial)}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colorMap[commercial._id] || '#2563eb' }}
                ></div>
                <span className="text-sm truncate">{commercial.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Panneau de détails utilisateur */}
      {selectedUser && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">{selectedUser.name}</h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedUser(null)}
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              selectedUser.status === 'online' ? 'bg-green-500' : 
              selectedUser.status === 'visiting' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm">
              {selectedUser.status === 'online' ? 'En ligne' : 
              selectedUser.status === 'visiting' ? 'En visite' : 
              selectedUser.status === 'traveling' ? 'En déplacement' : 'Hors ligne'}
            </span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <FiClock className="text-gray-500 mr-2" />
              <span className="text-sm">
                Dernière mise à jour: {formatDateTime(selectedUser.lastLocation?.timestamp)}
              </span>
            </div>
            {selectedUser.phone && (
              <div className="flex items-center">
                <FiPhone className="text-gray-500 mr-2" />
                <span className="text-sm">{selectedUser.phone}</span>
              </div>
            )}
            {selectedUser.email && (
              <div className="flex items-center">
                <FiMail className="text-gray-500 mr-2" />
                <span className="text-sm">{selectedUser.email}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Voir le profil
            </button>
            <button className="bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200">
              Voir l'historique
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
