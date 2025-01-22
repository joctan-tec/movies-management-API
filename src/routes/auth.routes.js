const express = require('express');
const { login, protectedRoute } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta protegida (requiere un token válido)
router.get('/protected', verifyToken, protectedRoute);

module.exports = router;