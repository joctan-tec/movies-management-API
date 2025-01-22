// dbConnection.js
require('dotenv').config(); // Importar dotenv para cargar las variables del .env
const { MongoClient } = require('mongodb');


// URI de la base de datos y opciones
const uri =  process.env.bdUri;

const dbName = process.env.bdName; // Nombre de la base de datos

console.log('soy'+uri);

const runDatabaseOperation = async (operation) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        console.log(`Conectado a la base de datos: ${dbName}`);
        await operation(db);
    } catch (error) {
        console.error('Error en la operación de la base de datos:', error);
    } finally {
        await client.close();
    }
};

module.exports = runDatabaseOperation;
