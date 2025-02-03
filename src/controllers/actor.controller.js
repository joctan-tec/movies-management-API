// controllers/actor.controller.js
const { runDatabaseOperation } = require('../BD/dbconnection'); // Importar la función de conexión
const { uploadImgs } = require('./img.controller');
require('dotenv').config();

async function searchActors(req, res) {
  const { searchText, page = 1, limit = 10 } = req.query;

  // 🔢 Convertir valores numéricos
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 6
  
  return await runDatabaseOperation(async (db) => {
      const actorsCollection = db.collection('actors');

      let matchStage = {};
      let sortStage = {};

      if (searchText && searchText.trim() !== "") {
          matchStage.$text = { $search: searchText };
          sortStage = { score: { $meta: "textScore" } };
      }

      const totalDocuments = await actorsCollection.countDocuments(matchStage);

      const aggregationPipeline = [
          { $match: matchStage },
          { $sort: sortStage },
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum },
          { $project: { _id: 0,  } } 
      ];

      const result = await actorsCollection.aggregate(aggregationPipeline).toArray();

      res.json({
          success: true,
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limitNum),
          totalResults: totalDocuments,
          actors: result
      });
  }).catch(error => {
      res.status(500).json({
          success: false,
          message: `Error en la operación de la base de datos: ${error.message}`
      });
  });
}


// Función para agregar un actor
async function addActor(req, res) {
  const { nombre, biografia, peliculas, fechaDeNacimiento, activo } = req.body;
  const images = req.files;

  // Si peliculas o activo no viene, se les pone valor por defecto
  const peliculasArray = peliculas || [];
  const isActive = activo !== undefined ? activo : true;
  
  let imageLinks = [];

  try {
      // Manejo de subida de imágenes
      if (images && images.length > 0) {
          const folder = `public/images/actors`;
          const results = await uploadImgs(images, folder);

          if (results instanceof Error) {
              throw new Error('Error al subir las imágenes');
          }

          const imagesPrefix = process.env.BUCKET_IMAGES_PREFIX;
          results.forEach((result) => {
              if (result.status === 'success') {
                  imageLinks.push({
                      url: `${imagesPrefix}${result.data.path}`,
                      activo: true,
                  });
              }
          });
      }

      // Crear un objeto con los datos del actor
      const actorData = {
          nombre,
          biografia,
          peliculas: peliculasArray,
          fechaDeNacimiento,
          imagenes: imageLinks,
          activo: isActive,
          createdAt: new Date(),
      };

      // Ejecutar la operación para insertar el actor en la base de datos
      await runDatabaseOperation(async (db) => {
          const collection = db.collection('actors');
          await collection.insertOne(actorData);
      });

      // Responder con éxito
      res.status(201).json({
          success: true,
          message: 'Actor agregado exitosamente',
          actor: actorData,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error al agregar actor',
          error: error.message,
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
    const actorName = req.params.name; // Nombre del actor a editar
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
  
module.exports = { getAllActors, getActorByName, addActor, addImageToActor, editActor, softDeleteActor, buscarActores, searchActors };