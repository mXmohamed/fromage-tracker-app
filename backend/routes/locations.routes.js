const express = require('express');
const router = express.Router();

// Route GET pour récupérer toutes les positions
router.get('/', (req, res) => {
  res.json({ message: 'Liste des positions - à implémenter' });
});

// Route GET pour récupérer les dernières positions de tous les commerciaux
router.get('/latest', (req, res) => {
  res.json({ message: 'Dernières positions des commerciaux - à implémenter' });
});

// Route GET pour récupérer l'historique des positions d'un commercial
router.get('/user/:userId', (req, res) => {
  res.json({ message: `Historique des positions du commercial ${req.params.userId} - à implémenter` });
});

// Route POST pour enregistrer une nouvelle position
router.post('/', (req, res) => {
  res.json({ message: 'Nouvelle position enregistrée - à implémenter', success: true });
});

module.exports = router;