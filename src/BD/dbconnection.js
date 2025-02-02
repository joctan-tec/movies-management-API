// dbConnection.js
require('dotenv').config(); // Importar dotenv para cargar las variables del .env
const { MongoClient } = require('mongodb');


// URI de la base de datos y opciones
const uri =  process.env.bdUri;

const dbName = process.env.bdName; // Nombre de la base de datos


const client = new MongoClient(uri);

async function runDatabaseOperation(callback) {
  let result;
  try {
    await client.connect();
    const db = client.db(`${dbName}`); // Seleccionar la base de datos
    result = await callback(db); // Ejecutar el callback y almacenar el resultado
  } catch (error) {
    console.error('Error en la operación de la base de datos:', error);
    throw error; // Propagar el error para que el servicio lo maneje
  } finally {
    await client.close(); // Cerrar la conexión
  }
  return result; // Devolver el resultado del callback
}

module.exports = runDatabaseOperation;