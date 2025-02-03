const express = require('express');
const { getAllActors, getActorByName, addActor, addImageToActor, editActor, softDeleteActor, buscarActores, searchActors } = require('../controllers/actor.controller');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', upload.array('imagenes', 10), addActor); // Ruta para agregar un actor
router.get('/search', searchActors)
router.patch('/addImg/:nombre', addImageToActor);  // Ruta agregar una img al actor
router.get('/', getAllActors);     // Ruta para obtener todos los actores
router.get('/getOne/:name',getActorByName)
router.put('/update/:name', upload.array('imagenes',10), editActor);  //Ruta modificar toda info actor
router.patch('/delete', softDeleteActor); // Ruta modifcar estado de actor@
router.post('/movieActors', buscarActores)

module.exports = router;
