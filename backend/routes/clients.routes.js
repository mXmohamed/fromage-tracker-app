const express = require('express');
const router = express.Router();

// Route GET pour récupérer tous les clients
router.get('/', (req, res) => {
  res.json({ message: 'Liste des clients - à implémenter' });
});

// Route GET pour récupérer un client par son ID
router.get('/:id', (req, res) => {
  res.json({ message: `Détails du client ${req.params.id} - à implémenter` });
});

// Route POST pour créer un nouveau client
router.post('/', (req, res) => {
  res.json({ message: 'Nouveau client créé - à implémenter', success: true });
});

// Route PUT pour mettre à jour un client
router.put('/:id', (req, res) => {
  res.json({ message: `Client ${req.params.id} mis à jour - à implémenter` });
});

// Route DELETE pour supprimer un client
router.delete('/:id', (req, res) => {
  res.json({ message: `Client ${req.params.id} supprimé - à implémenter` });
});

module.exports = router;