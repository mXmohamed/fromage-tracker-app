const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
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
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'Kg'
    },
    total: {
      type: Number // price * quantity
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'check', 'other'],
    default: 'bank_transfer'
  },
  notes: {
    type: String
  },
  subtotal: {
    type: Number
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number
  },
  deliveryDate: {
    type: Date
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  }
}, {
  timestamps: true
});

// Pre-save hook pour calculer les totaux
SaleSchema.pre('save', function(next) {
  // Calculer le total pour chaque article
  this.items.forEach(item => {
    item.total = item.price * item.quantity;
  });

  // Calculer le sous-total
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Calculer le total avec taxes et remises
  this.total = this.subtotal + this.tax - this.discount;

  next();
});

// Index géospatial
SaleSchema.index({ location: '2dsphere' });

// Index pour les recherches et tris courants
SaleSchema.index({ date: -1 });
SaleSchema.index({ client: 1, date: -1 });
SaleSchema.index({ user: 1, date: -1 });
SaleSchema.index({ status: 1 });

module.exports = mongoose.model('Sale', SaleSchema);
