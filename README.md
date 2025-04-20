# FroMo - Application de Suivi des Commerciaux

Application de suivi géographique pour commerciaux de fromages avec tableau de bord manager et application mobile.

## Structure du Projet

- `/backend` - API REST Node.js/Express
- `/web-app` - Application web React pour le manager
- `/mobile-app` - Application mobile React Native pour les commerciaux
- `/database` - Scripts et modèles de base de données MongoDB

## Fonctionnalités

### Application Mobile
- Suivi de localisation géographique en temps réel
- Enregistrement des visites clients
- Catalogue de produits
- Saisie des commandes

### Application Web (Dashboard Manager)
- Suivi en temps réel des commerciaux
- Analyse des performances de vente
- Gestion des produits et clients
- Rapports d'activité

## Prérequis

- Node.js (version 18.18.0 recommandée, voir fichier `.nvmrc`)
- MongoDB
- Expo CLI (pour l'application mobile)

## Installation

### 1. Configuration des variables d'environnement

Dans chaque sous-dossier (`backend`, `web-app`, `mobile-app`), copiez le fichier `.env.example` en `.env` et mettez à jour les valeurs selon votre environnement.

```bash
# Pour le backend
cd backend
cp .env.example .env

# Pour l'application web
cd web-app
cp .env.example .env

# Pour l'application mobile
cd mobile-app
cp .env.example .env
```

### 2. Installation des dépendances

```bash
# Installation des dépendances du backend
cd backend
npm install

# Installation des dépendances de l'application web
cd web-app
npm install

# Installation des dépendances de l'application mobile
cd mobile-app
npm install
```

### 3. Démarrage des services

```bash
# Démarrage du backend
cd backend
npm run dev

# Démarrage de l'application web
cd web-app
npm start

# Démarrage de l'application mobile
cd mobile-app
npm start
```

## Développement

Pour faciliter le développement, il est recommandé d'utiliser la version de Node.js spécifiée dans le fichier `.nvmrc`. Si vous utilisez nvm, vous pouvez simplement exécuter :

```bash
nvm use
```

### URLs par défaut des services

- Backend API: http://localhost:5000
- Web App: http://localhost:3000
- Mobile App: Disponible via l'application Expo Go

## Notes concernant les corrections de la branche `fix-build-errors`

Cette branche contient plusieurs corrections pour résoudre les problèmes de build :

1. **Correction des importations d'icônes dans l'application mobile**
   - Remplacement de `ShoppingCart` par `ShoppingBag` (icône disponible dans react-native-feather)

2. **Standardisation des variables d'environnement**
   - Ajout de fichiers `.env.example` pour tous les composants
   - Utilisation cohérente des URLs d'API

3. **Gestion des versions de Node.js**
   - Ajout d'un fichier `.nvmrc` pour spécifier la version recommandée

4. **Correction des services avec URLs codées en dur**
   - Mise à jour des services pour utiliser des URL configurables

5. **Amélioration de la configuration pour l'émulation mobile**
   - Utilisation de `10.0.2.2` pour pointer vers localhost sur l'émulateur Android

## Déploiement

Instructions de déploiement à venir...
