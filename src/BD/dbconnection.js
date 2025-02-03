require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.bdUri;
const dbName = process.env.bdName;

const client = new MongoClient(uri);

let db; // Variable global para reutilizar la conexión

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(dbName);
      console.log("Conectado a MongoDB");
    } catch (error) {
      console.error("Error conectando a MongoDB:", error);
      throw error;
    }
  }
  return db;
}

async function runDatabaseOperation(callback) {
  try {
    const db = await connectDB(); // Usa la conexión persistente
    return await callback(db);
  } catch (error) {
    console.error("Error en la operación de la base de datos:", error);
    throw error;
  }
}

module.exports = { runDatabaseOperation, connectDB };
