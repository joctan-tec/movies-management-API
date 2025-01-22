// dbConnection.js
require('dotenv').config(); // Importar dotenv para cargar las variables del .env
const { MongoClient } = require('mongodb');


// URI de la base de datos y opciones
const uri =  process.env.bdUri;

const dbName = process.env.bdName; // Nombre de la base de datos

console.log('soy '+uri);
console.log('bd '+dbName);
const client = new MongoClient(uri);

async function runDatabaseOperation(callback) {
  try {
    await client.connect();
    console.log('Conexión exitosa a la base de datos');
    const db = client.db(`${dbName}`); // Seleccionar la base de datos 
    await callback(db); // Ejecutar el callback pasando el objeto de base de datos
  } catch (error) {
    console.error('Error en la operación de la base de datos:', error);
  } finally {
    await client.close(); // Cerrar la conexión
  }
}

module.exports = runDatabaseOperation;