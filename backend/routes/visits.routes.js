const express = require('express');
const router = express.Router();

// Route GET pour récupérer toutes les visites
router.get('/', (req, res) => {
  res.json({ message: 'Liste des visites - à implémenter' });
});

// Route GET pour récupérer les visites d'un commercial
router.get('/user/:userId', (req, res) => {
  res.json({ message: `Visites du commercial ${req.params.userId} - à implémenter` });
});

// Route GET pour récupérer une visite par son ID
router.get('/:id', (req, res) => {
  res.json({ message: `Détails de la visite ${req.params.id} - à implémenter` });
});

// Route POST pour créer une nouvelle visite
router.post('/', (req, res) => {
  res.json({ message: 'Nouvelle visite créée - à implémenter', success: true });
});

// Route PUT pour mettre à jour une visite
router.put('/:id', (req, res) => {
  res.json({ message: `Visite ${req.params.id} mise à jour - à implémenter` });
});

// Route DELETE pour supprimer une visite
router.delete('/:id', (req, res) => {
  res.json({ message: `Visite ${req.params.id} supprimée - à implémenter` });
});

module.exports = router;