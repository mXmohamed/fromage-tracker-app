const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  accuracy: {
    type: Number
  },
  altitude: {
    type: Number
  },
  speed: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  activityType: {
    type: String,
    enum: ['stationary', 'walking', 'driving', 'unknown'],
    default: 'unknown'
  },
  address: {
    formatted: String,
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  metadata: {
    deviceModel: String,
    appVersion: String,
    networkType: String
  }
}, {
  timestamps: true
});

// Index géospatial pour les recherches par proximité
LocationSchema.index({ location: '2dsphere' });

// Index pour les requêtes fréquentes
LocationSchema.index({ user: 1, timestamp: -1 });
LocationSchema.index({ timestamp: -1 });

// Méthode pour vérifier si c'est la dernière position connue
LocationSchema.methods.isLastKnown = async function() {
  const latestLocation = await this.model('Location')
    .findOne({ user: this.user })
    .sort({ timestamp: -1 })
    .limit(1);

  return latestLocation && latestLocation._id.equals(this._id);
};

// Méthode pour calculer la distance avec un autre point
LocationSchema.methods.distanceTo = function(lon, lat) {
  // À implémenter avec une formule comme Haversine
  // Pour calculer la distance en mètres
};

module.exports = mongoose.model('Location', LocationSchema);
