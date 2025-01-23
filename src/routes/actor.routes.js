const express = require('express');
const { getAllActors, getActorByName, addActor, addImageToActor, addMovieToActor, editActor, softDeleteActor } = require('../controllers/actor.controller');
const router = express.Router();

router.post('/create', addActor);  // Ruta para crear un actor
router.post('/addImg', addImageToActor);  // Ruta para crear un actor
router.post('/addMov', addMovieToActor);  // Ruta para crear un actor
router.get('/', getAllActors);     // Ruta para obtener todos los actores
router.get('/getOne',getActorByName)
router.put('/update', editActor);  //Ruta modificar toda info actor
router.patch('/delete', softDeleteActor); // Ruta modifcar estado de actor@

module.exports = router;
