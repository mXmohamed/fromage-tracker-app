const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Pâte molle',
      'Pâte pressée',
      'Pâte persillée',
      'Pâte fraîche',
      'Chèvre',
      'Autre'
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['Kg', 'Unité', 'Portion'],
    default: 'Kg'
  },
  image: {
    type: String
  },
  origin: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Méthode pour vérifier si le produit est en stock
ProductSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Index pour la recherche
ProductSchema.index({ name: 'text', description: 'text', category: 'text', origin: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
