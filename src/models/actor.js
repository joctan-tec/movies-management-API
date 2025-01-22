const runDatabaseOperation = require('../BD/dbconnection');

const insertActor = async (actorData) => {
  await runDatabaseOperation(async (db) => {
    const collection = db.collection("actores");
    const resultado = await collection.insertOne(actorData);
    console.log("Actor insertado con ID:", resultado.insertedId);
  });
};

module.exports = {
  insertActor,
};
