// controllers/actor.controller.js
const runDatabaseOperation = require('../BD/dbconnection'); // Importar la función de conexión

// Función para agregar un actor
async function addActor(req, res) {
  const { nombre, biografia, peliculas, fechaDeNacimiento, imagenes } = req.body;

  const actorData = {
    nombre, //string
    biografia, //string
    peliculas, //string[]
    fechaDeNacimiento,  //date
    imagenes//imgs[]
  };

  try {
    // Ejecutar la operación para insertar el actor en la base de datos
    await runDatabaseOperation(async (db) => {
      const collection = db.collection('actors');
      const result = await collection.insertOne(actorData);
      
      // Responder con el resultado
      res.status(201).json({
        message: 'Actor agregado exitosamente',
        actorId: result.insertedId
      });
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al agregar actor',
      error: error.message
    });
  }
}


async function getAllActors(req, res) {
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors"); // Referencia a la colección de actores
        const actors = await collection.find().toArray(); // Obtener todos los actores de la colección
  
        res.status(200).json({
          message: 'Actores obtenidos exitosamente',
          actors: actors, // Devolvemos todos los actores como un array
        });
      });
    } catch (error) {
      // Si ocurre un error durante la operación, lo capturamos y respondemos con un mensaje
      res.status(500).json({
        message: 'Error al obtener actores',
        error: error.message,
      });
    }
  }

  //Todo hacer borrado lógico
  async function editActor(req, res) {
    const actorName = req.body.nombre; // body si recibe json, params si es en la url
    const updatedData = req.body;  // Nuevos datos del actor
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors");
        
        const actor = await collection.findOne({ nombre: actorName });
        if (!actor) {return res.status(404).json({ message: 'No se encontró un actor con ese nombre' });}
  
        // Usamos updateOne para actualizar el actor por su _id
        const result = await collection.updateOne(
          { _id: actor._id },  // Criterio de búsqueda
          { $set: updatedData }  // Datos a actualizar
        );
  
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Actor no encontrado' });
        }
  
        // Respondemos con el mensaje de éxito
        res.status(200).json({ message: 'Actor actualizado exitosamente', actor: { ...actor, ...updatedData } });
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al editar el actor', error: error.message });
    }
  }
  
  

  async function softDeleteActor(req, res) {

    const actorName = req.body.nombre; // ID del actor que se va a "eliminar"
    await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors");
        
        const actor = await collection.findOne({ nombre: actorName });
        if (!actor) {return res.status(404).json({ message: 'No se encontró un actor con ese nombre' });}
  
        actor.activo = false;  // Marcamos al actor como "eliminado"
        await actor.save();  // Guardamos los cambios
  
        res.status(200).json({ message: 'Actor eliminado lógicamente', actor });
    });
  }
module.exports = { getAllActors, addActor, editActor, softDeleteActor };
