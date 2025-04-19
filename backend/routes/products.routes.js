const express = require('express');
const router = express.Router();

// Route GET pour récupérer tous les produits
router.get('/', (req, res) => {
  res.json({ message: 'Liste des produits fromagers - à implémenter' });
});

// Route GET pour récupérer un produit par son ID
router.get('/:id', (req, res) => {
  res.json({ message: `Détails du produit ${req.params.id} - à implémenter` });
});

// Route POST pour créer un nouveau produit
router.post('/', (req, res) => {
  res.json({ message: 'Nouveau produit créé - à implémenter', success: true });
});

// Route PUT pour mettre à jour un produit
router.put('/:id', (req, res) => {
  res.json({ message: `Produit ${req.params.id} mis à jour - à implémenter` });
});

// Route DELETE pour supprimer un produit
router.delete('/:id', (req, res) => {
  res.json({ message: `Produit ${req.params.id} supprimé - à implémenter` });
});

module.exports = router;