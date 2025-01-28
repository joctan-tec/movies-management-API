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
      const result = await collection.insertOne(actorData,{ projection: { _id: 0 }});
      
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
        const actors = await collection.find({ activo: true }).project({ _id: 0 }).toArray(); // Obtener todos los actores de la colección
  
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

  async function getActorByName(req, res) {
    const actorName = req.params.name;
    console.log(actorName);
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors"); // Referencia a la colección de actores
        const actor = await collection.findOne({ nombre: actorName,activo:true },{ projection: { _id: 0 }});
        if (!actor) {return res.status(404).json({ message: 'No se encontró un actor con ese nombre' });}
        res.status(200).json({
          message: 'Actor obtenidos exitosamente',
          actor: actor, // Devolvemos todos los actores como un array
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

  async function addImageToActor(req, res) {
    const actorName = req.params.name; // El nombre del actor
    const newImage = req.body; // La nueva imagen enviada en el body
  
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors");
        const result = await collection.updateOne(
          { nombre: actorName }, // Condición de búsqueda
          { $push: { imagenes: newImage }},
          { projection: { _id: 0 }} // Agregar al array 'imagenes'
        );
  
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Actor no encontrado" });
        }
  
        res.status(200).json({ message: "Imagen agregada con éxito", result });
      });
    } catch (error) {
      res.status(500).json({ message: "Error al agregar la imagen", error });
    }
  }

  async function addMovieToActor(req, res) {
    const actorName = req.params.name; // El nombre del actor
    const newPelicula = req.body; // La nueva pelicula enviada en el body
  
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors");
        const result = await collection.updateOne(
          { nombre: actorName }, // Condición de búsqueda
          { $push: { peliculas: newPelicula } }, // Agregar al array 'peliculas'
          { projection: { _id: 0 }}
        );
  
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Actor no encontrado" });
        }
  
        res.status(200).json({ message: "Pelicula agregada con éxito", result });
      });
    } catch (error) {
      res.status(500).json({ message: "Error al agregar la pelicula", error });
    }
  }
  

  async function editActor(req, res) {
    const actorName = req.body.nombre; 
    const updatedData = req.body;  // Nuevos datos del actor
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection("actors");
        
        const actor = await collection.findOne({ nombre: actorName });
        if (!actor) {
          return res.status(404).json({ message: 'No se encontró un actor con ese nombre' });
        }
  
        
        const result = await collection.updateOne(
          { _id: actor._id },  // Criterio de búsqueda
          { $set: updatedData }  // Datos a actualizar
        );
  
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Actor no encontrado' });
        }
  
        // Aquí eliminamos el _id de la respuesta
        const updatedActor = { ...actor, ...updatedData };
        delete updatedActor._id; // Eliminamos el _id antes de responder
  
        // Respondemos con el mensaje de éxito
        res.status(200).json({ message: 'Actor actualizado exitosamente', actor: updatedActor });
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al editar el actor', error: error.message });
    }
  }
  
  
  

  async function softDeleteActor(req, res) {

    const actorName = req.body.nombre; // ID del actor que se va a "eliminar"
    await runDatabaseOperation(async (db) => {
      const collection = db.collection("actors");

      // Buscar el actor con el filtro
      const actor = await collection.findOne({ nombre: actorName, activo: true }, { projection: { _id: 0 } });
      if (!actor) {
        return res.status(404).json({ message: 'No se encontró un actor con ese nombre' });
      }
      
      // Actualizar el campo activo a false
      await collection.updateOne(
        { nombre: actorName }, // Filtro para identificar el documento
        { $set: { activo: false } } // Actualización del campo
      );
      
      // Enviar la respuesta al cliente
      res.status(200).json({ message: 'Actor eliminado lógicamente', actor });
      
    });
  }
module.exports = { getAllActors, getActorByName, addActor, addImageToActor, addMovieToActor, editActor, softDeleteActor };
