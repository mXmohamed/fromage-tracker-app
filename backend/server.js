const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Variables d'environnement
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fromage-tracker';

// Connexion à MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/clients', require('./routes/clients.routes'));
app.use('/api/visits', require('./routes/visits.routes'));
app.use('/api/sales', require('./routes/sales.routes'));
app.use('/api/locations', require('./routes/locations.routes'));

// Route par défaut
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API FroMo Tracker' });
});

// Gestion des connexions Socket.io pour le suivi en temps réel
io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket:', socket.id);

  // Écoute des mises à jour de position
  socket.on('position_update', (data) => {
    // Diffusion de la position à tous les clients connectés
    io.emit('position_updated', data);
    
    // Sauvegarde en base de données (sera implémentée plus tard)
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, io };
