// controllers/actor.controller.js
const runDatabaseOperation = require('../BD/dbconnection'); // Importar la función de conexión


// Función para agregar un actor
async function addActor(req, res) {
  const { nombre, biografia, peliculas, fechaDeNacimiento, imagenes, activo } = req.body;

  const actorData = {
    nombre, //string
    biografia, //string
    peliculas, //string[]
    fechaDeNacimiento,  //date
    imagenes,//imgs[]
    activo //true
  };

  try {
    // Ejecutar la operación para insertar el actor en la base de datos
    await runDatabaseOperation(async (db) => {
      const collection = db.collection('actors');
      const result = await collection.insertOne(actorData,{ projection: { _id: 0 }});
      
      // Responder con el resultado
      res.status(201).json({
        message: 'Actor agregado exitosamente'
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
    const actorName = req.params.nombre; // El nombre del actor
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
    const actorName = req.body.nombre; // Nombre del actor que se va a "eliminar"
  
    await runDatabaseOperation(async (db) => {
      const actorCollection = db.collection("actors");
      const movieCollection = db.collection("movies");
  
      // Buscar el actor que queremos eliminar
      const actor = await actorCollection.findOne({ nombre: actorName, activo: true });
      if (!actor) {
        return res.status(404).json({ message: "No se encontró un actor con ese nombre" });
      }
  
      // Marcar el actor como inactivo
      await actorCollection.updateOne(
        { nombre: actorName },
        { $set: { activo: false } }
      );
  
      // Eliminar al actor de las películas en las que aparece
      await movieCollection.updateMany(
        { reparto: { $in: [actorName] } }, // Buscar películas que contengan al actor en "reparto"
        { $pull: { reparto: actorName } }  // Eliminar el actor del array "reparto"
    );
  
      // Enviar respuesta al cliente
      res.status(200).json({
        message: "Actor eliminado lógicamente y eliminado de las películas",
        actor,
      });
    });
  }

  async function buscarActores  (req, res) {
    const { reparto } = req.body;
  
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection('actors');
  
  
        const peliculasEncontradas = await collection.find({ nombre: { $in: reparto } }).toArray();
  
  
        res.status(200).json({
          message: peliculasEncontradas.length > 0 ? 'Actores encontrados' : 'No se encontraron actores',
          peliculas: peliculasEncontradas
        });
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al buscar actores',
        error: error.message
      });
    }
  };
  
module.exports = { getAllActors, getActorByName, addActor, addImageToActor, editActor, softDeleteActor, buscarActores };