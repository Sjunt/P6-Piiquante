const multer = require('multer');

//Création d'un dictionnaire MIMETYPE
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/jpeg': 'jpeg'
};

//fonction diskStorage de multer permet d'enregistrer sur le disk
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        //images = nom du dossier
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        //Génération du nom du fichier
        const name = file.originalname.split(' ').join('_');
        //L'extension du fichier correspondra au MIMETYPE
        const extension = MIME_TYPES[file.mimetype];
        //Création du fichier composé de name+date.now+'.'+extension
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');