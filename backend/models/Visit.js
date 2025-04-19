const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  notes: {
    type: String
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
  photos: [{
    url: String,
    caption: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  productsPresented: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    notes: String
  }],
  sales: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  }]
}, {
  timestamps: true
});

// Index géospatial pour les recherches par proximité
VisitSchema.index({ location: '2dsphere' });

// Méthode pour calculer la durée de la visite
VisitSchema.methods.getDuration = function() {
  if (!this.endTime) return null;
  
  const duration = this.endTime - this.startTime;
  const minutes = Math.floor(duration / 1000 / 60);
  
  return minutes;
};

module.exports = mongoose.model('Visit', VisitSchema);
