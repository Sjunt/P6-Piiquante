const Sauce = require('../models/Sauce');
const fs = require('fs');

//Création de la sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  //Suppression du champs id et userId pour les généré automatiquement via le token d'authentification
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    //test like
    likes: 0,
    dislikes: 0,
    usersLiked: [" "],
    usersDisliked: [" "]
  });
  sauce.save()
  .then(() => res.status(201).json({message: 'Objet enregistré !'}))
  .catch(error => res.status(400).json({error}));
  };

  //Modification de la sauce
exports.modifySauce = (req, res, next) => {
  //req.file permet de vérifier si un champs file est présent dans l'objet
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

//Suppression de l'userId de la requête
  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    //vérification si le champs userId de la base de donnée est different de l'userId qui vient du token (req.auth.userId)
    //si cette condition est vrai alors quelqu'un essaye de modifier quelque chose qui ne lui appartient pas
      if (sauce.userId != req.auth.userId) {
          res.status(401).json({ message : 'Not authorized'});
      } else {
          //MAJ de sauce
        Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message : 'Objet modifié!'}))
        .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};

//Suppression sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({message: 'Not authorized'});
    } else {
    //Méthode split pour récupérer un nom de fichier autour du répertoire images
      const filename = sauce.imageUrl.split('/images/')[1];
      //Méthode unlink pour supprimer
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({_id: req.params.id})
        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
        .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch( error => {
      res.status(500).json({ error });
    });
};

  //Récupérer une sauce
  //findOne permet de trouver un objet
  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));
  };

  //Récupérer toutes les sauces
  //find permet de trouver la totalité des objets
  exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
  };

  //Ajout des likes dislikes
exports.likeDislike = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    const userId = req.auth.userId;
    const like = req.body.like;
    //Switch permet au programme d'éxecuter les instructions associés par rapport au clause case
    switch (like) {
    // Définition des cases pour chaque fonctionnalités, Incrémentation like/dislike/annulation
    // Incrémentation de nombre de like +1
      case 1: 
      //La méthode includes() permet de déterminer si un tableau contient une valeur et renvoie true si c'est le cas, false sinon.
      //push permet d'ajouter la valeur au tableau
      if (!sauce.usersLiked.includes(userId)) {
        sauce.usersLiked.push(userId);
        ++sauce.likes;
        console.log(sauce.likes);
      }
      //L'instruction break peut optionnellement être utilisée pour chaque cas et permet de s'assurer que seules les instructions associées à ce cas seront exécutées.
      break;

      // Incrémentation du nombre de dislike +1
      case -1:
      if (!sauce.usersDisliked.includes(userId)) {
        sauce.usersDisliked.push(userId);
        ++sauce.dislikes;
        console.log(sauce.dislikes);
      };
      break;

      // Possibilité d'annulé un like ou un dislike
      case 0:
        if (sauce.usersLiked.includes(userId)) {
          //La méthode indexOf() renvoie le premier indice pour lequel on trouve un élément donné dans un tableau. Si l'élément cherché n'est pas présent dans le tableau, la méthode renverra -1.
          sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
          --sauce.likes;
          console.log(sauce.likes);
        } else if (sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
          --sauce.dislikes;
          console.log(sauce.dislikes);
        }
      break;
    }
    sauce.save()
    .then(() => { res.status(200).json({message: 'Avis enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
  })
  .catch(error => res.status(404).json({ error }));
};