const express = require('express');
const router = express.Router();

// Route GET pour récupérer tous les utilisateurs
router.get('/', (req, res) => {
  res.json({ message: 'Liste des utilisateurs - à implémenter' });
});

// Route GET pour récupérer un utilisateur par son ID
router.get('/:id', (req, res) => {
  res.json({ message: `Détails de l'utilisateur ${req.params.id} - à implémenter` });
});

// Route PUT pour mettre à jour un utilisateur
router.put('/:id', (req, res) => {
  res.json({ message: `Utilisateur ${req.params.id} mis à jour - à implémenter` });
});

// Route DELETE pour supprimer un utilisateur
router.delete('/:id', (req, res) => {
  res.json({ message: `Utilisateur ${req.params.id} supprimé - à implémenter` });
});

module.exports = router;