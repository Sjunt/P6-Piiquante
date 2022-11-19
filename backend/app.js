//Importation d'express qui contiendra l'app
const express = require('express');
const app = express();
//Importation de mongoose
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

//Importation helmet (protection contre les vulnérabilités web)
const helmet = require('helmet');

//Récupération des données du .env
//Dotenv permet de sécuriser les mdp en passant par un fichier .env
require('dotenv').config();

mongoose.connect(process.env.MONGOOSE_URL,
{ useNewUrlParser: true,
    useUnifiedTopology: true})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
//console.log(process.env.MONGOOSE_URL);

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

 //noSniff permet de ne pas bloquer les images 
app.use(helmet.noSniff());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;