const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware.authenticate);

// Enregistrer une nouvelle position
router.post('/', locationController.recordLocation);

// Récupérer la dernière position de l'utilisateur connecté
router.get('/last', locationController.getLastLocation);

// Récupérer l'historique des positions de l'utilisateur connecté
router.get('/history', locationController.getLocationHistory);

// Récupérer la dernière position d'un utilisateur spécifique
router.get('/user/:userId/last', locationController.getLastLocation);

// Récupérer l'historique des positions d'un utilisateur spécifique
router.get('/user/:userId/history', locationController.getLocationHistory);

// Récupérer les dernières positions de tous les utilisateurs (réservé aux managers)
router.get('/all', authMiddleware.authorize(['manager']), locationController.getAllLastLocations);

// Trouver les utilisateurs à proximité d'un point
router.get('/nearby', locationController.findNearbyUsers);

module.exports = router;
