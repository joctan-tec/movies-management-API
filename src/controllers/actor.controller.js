// controllers/actor.controller.js
const runDatabaseOperation = require('../BD/dbconnection'); // Importar la función de conexión

// Función para agregar un actor
async function addActor(req, res) {
  const { nombre, edad, peliculas, fechaDeNacimiento } = req.body;

  const actorData = {
    nombre,
    edad,
    peliculas,
    fechaDeNacimiento,
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

module.exports = { addActor };
