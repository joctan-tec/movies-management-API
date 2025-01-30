const express = require('express');
const { getAllActors, getActorByName, addActor, addImageToActor, editActor, softDeleteActor } = require('../controllers/actor.controller');
const router = express.Router();

router.post('/create', addActor);  // Ruta para crear un actor
router.patch('/addImg/:nombre', addImageToActor);  // Ruta agregar una img al actor
router.get('/', getAllActors);     // Ruta para obtener todos los actores
router.get('/getOne/:name',getActorByName)
router.put('/update', editActor);  //Ruta modificar toda info actor
router.patch('/delete', softDeleteActor); // Ruta modifcar estado de actor@

module.exports = router;
