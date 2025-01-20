const express = require('express');
const router = express.Router();

// Ejemplo de una ruta básica
router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de gestión de películas!');
});

module.exports = router;