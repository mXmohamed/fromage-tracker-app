const Location = require('../models/Location');
const User = require('../models/User');

/**
 * Enregistrer une nouvelle position
 */
exports.recordLocation = async (req, res) => {
  try {
    const { coordinates, accuracy, altitude, speed, batteryLevel, activityType, address, metadata } = req.body;
    
    // Vérifier les données minimales requises
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Les coordonnées sont requises et doivent être un tableau [longitude, latitude]'
      });
    }

    // Créer une nouvelle entrée de localisation
    const location = new Location({
      user: req.user._id,
      location: {
        type: 'Point',
        coordinates
      },
      accuracy,
      altitude,
      speed,
      timestamp: new Date(),
      batteryLevel,
      activityType,
      address,
      metadata
    });

    await location.save();

    // Mettre à jour la dernière position de l'utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      lastLocation: {
        lat: coordinates[1],
        lng: coordinates[0],
        timestamp: new Date()
      }
    });

    // Émettre un événement pour les clients connectés via socket.io
    req.app.get('io').emit('position_updated', {
      userId: req.user._id,
      name: req.user.name,
      coordinates,
      timestamp: location.timestamp
    });

    res.status(201).json({
      success: true,
      location
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la position:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la position',
      error: error.message
    });
  }
};

/**
 * Récupérer la dernière position d'un utilisateur
 */
exports.getLastLocation = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Vérifier si l'utilisateur existe
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer la dernière position
    const lastLocation = await Location.findOne({ user: userId })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!lastLocation) {
      return res.status(404).json({
        success: false,
        message: 'Aucune position trouvée pour cet utilisateur'
      });
    }

    res.status(200).json({
      success: true,
      location: lastLocation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière position:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la dernière position',
      error: error.message
    });
  }
};

/**
 * Récupérer l'historique des positions d'un utilisateur
 */
exports.getLocationHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { startDate, endDate, limit = 100, page = 1 } = req.query;
    
    // Vérifier si l'utilisateur existe
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Construire le filtre de date
    const filter = { user: userId };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Récupérer l'historique
    const locations = await Location.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Compter le total de résultats
    const total = await Location.countDocuments(filter);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      locations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des positions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique des positions',
      error: error.message
    });
  }
};

/**
 * Récupérer les dernières positions de tous les utilisateurs (pour le manager)
 */
exports.getAllLastLocations = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Cette fonctionnalité est réservée aux managers'
      });
    }

    // Récupérer tous les utilisateurs actifs avec leur dernière position
    const users = await User.find({ active: true }).select('name email role lastLocation status');

    // Pour chaque utilisateur sans lastLocation, chercher dans la collection Location
    const enhancedUsers = await Promise.all(users.map(async user => {
      if (!user.lastLocation || !user.lastLocation.timestamp) {
        const lastLoc = await Location.findOne({ user: user._id })
          .sort({ timestamp: -1 })
          .limit(1);
        
        if (lastLoc) {
          user.lastLocation = {
            lat: lastLoc.location.coordinates[1],
            lng: lastLoc.location.coordinates[0],
            timestamp: lastLoc.timestamp
          };
        }
      }
      return user;
    }));

    res.status(200).json({
      success: true,
      users: enhancedUsers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des positions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des positions',
      error: error.message
    });
  }
};

/**
 * Trouver les utilisateurs à proximité d'un point
 */
exports.findNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // Distance en mètres

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Les coordonnées (longitude, latitude) sont requises'
      });
    }

    // Rechercher les dernières positions à proximité
    const nearbyLocations = await Location.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Dernières 24h
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $group: {
          _id: '$user',
          lastLocation: { $first: '$$ROOT' },
          distance: { $first: '$distance' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            name: 1,
            role: 1,
            status: 1
          },
          location: '$lastLocation.location',
          timestamp: '$lastLocation.timestamp',
          distance: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      users: nearbyLocations
    });
  } catch (error) {
    console.error('Erreur lors de la recherche des utilisateurs à proximité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des utilisateurs à proximité',
      error: error.message
    });
  }
};
