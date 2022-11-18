//Installation bcrypt et jsonwebtoken
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Importation du model
const User = require('../models/User');

//Création du compte utilisateur
exports.signup = (req, res, next) => {
    //Hachage du mdp
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        //Création d'une nouvelle instance du modele user avec new User
        const user = new User ({
            email: req.body.email,
            password: hash
        });
        //Save permet d'enregistrer l'objet dans la base de donnée
        user.save()
        .then(() => res.status(201).json ({ message : 'Utilisateur créé !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({ error }));
};

//Connexion des utilisateurs
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email})
    //Check si l'utilisateur existe déjà
    .then(user => {
        if (user === null){
            res.status(401).json({message: 'Paire identifiant/mot de pass incorrecte'});
        } else {
            //Compare ce qui a été saisie avec ce qui se trouve dans la base de donnée
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid){
                    res.status(401).json({message: 'Paire identifiant/mot de pass incorrecte'});
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId : user._id},
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h'}
                        )
                    });
                }
            })
            .catch(error => {
                res.status(500).json({error})
            });
        }
    })
    .catch(error => {
        res.status(500).json( {error})
    });
};
