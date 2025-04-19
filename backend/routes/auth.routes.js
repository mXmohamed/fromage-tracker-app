const express = require('express');
const router = express.Router();

// Route POST pour l'authentification
router.post('/login', (req, res) => {
  res.json({ message: 'Authentification - à implémenter', token: 'sample-token' });
});

// Route POST pour l'inscription
router.post('/register', (req, res) => {
  res.json({ message: 'Inscription - à implémenter', success: true });
});

module.exports = router;