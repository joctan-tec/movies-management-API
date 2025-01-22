const express = require('express');
const router = express.Router();

// Ejemplo de una ruta básica
router.get('/', async (req, res) => {
  try {
    // Conectar a la base de datos
    

    // Respuesta al cliente una vez se haya completado la operación de conexión
    res.send('¡Bienvenido a la API de gestión de películas!');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).send('Error al conectar a la base de datos');
  }
});

module.exports = router;
