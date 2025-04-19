const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      name,
      email,
      password,
      role,
      phone
    });

    await user.save();

    // Générer le token JWT
    const token = generateToken(user);

    // Renvoyer la réponse avec le token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription', 
      error: error.message 
    });
  }
};

/**
 * Connexion d'un utilisateur existant
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier si le mot de passe est correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Mettre à jour le statut de l'utilisateur
    user.status = 'online';
    await user.save();

    // Générer le token JWT
    const token = generateToken(user);

    // Renvoyer la réponse avec le token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion', 
      error: error.message 
    });
  }
};

/**
 * Déconnexion d'un utilisateur
 */
exports.logout = async (req, res) => {
  try {
    // Mettre à jour le statut de l'utilisateur
    const user = await User.findById(req.user.id);
    user.status = 'offline';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la déconnexion', 
      error: error.message 
    });
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du profil', 
      error: error.message 
    });
  }
};

/**
 * Générer un token JWT
 * @param {User} user Utilisateur pour lequel générer le token
 * @returns {String} Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};
