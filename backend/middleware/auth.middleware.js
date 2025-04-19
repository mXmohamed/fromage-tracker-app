const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Middleware pour authentifier l'utilisateur via le token JWT
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Chercher l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou token invalide'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: error.message
    });
  }
};

/**
 * Middleware pour autoriser uniquement certains rôles
 * @param {Array} roles Tableau des rôles autorisés
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé pour ce rôle'
      });
    }

    next();
  };
};
