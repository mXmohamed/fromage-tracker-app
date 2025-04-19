const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Fromagerie', 'Restaurant', 'Épicerie', 'Grande surface', 'Autre'],
    default: 'Autre'
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'France'
    }
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
  contactName: {
    type: String
  },
  contactPhone: {
    type: String
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  notes: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index géospatial pour les recherches par proximité
ClientSchema.index({ location: '2dsphere' });

// Index pour la recherche textuelle
ClientSchema.index({ name: 'text', 'address.city': 'text', contactName: 'text' });

// Méthode pour calculer la distance avec un autre point
ClientSchema.methods.distanceFrom = function(lat, lng) {
  // Calcul de la distance (à implémenter plus tard)
  // Utilisation de la formule de Haversine par exemple
};

module.exports = mongoose.model('Client', ClientSchema);
