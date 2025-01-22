const { insertActor } = require('../models/actor');

const createActor = async (req, res) => {
  const { nombre, edad, peliculas } = req.body;

  if (!nombre || !edad) {
    return res.status(400).send("Faltan datos obligatorios");
  }

  const actorData = {
    nombre,
    edad,
    peliculas: peliculas || [],
    creadoEn: new Date(),
  };

  try {
    await insertActor(actorData);
    res.status(201).send("Actor creado exitosamente");
  } catch (error) {
    console.error("Error al crear el actor:", error);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports = {
  createActor,
};
