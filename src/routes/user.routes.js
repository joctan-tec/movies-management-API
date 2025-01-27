const express = require('express');
const { getAllUsers, createUser } = require('../controllers/user.controller');

const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAllUsers);
// Middleware de multer para manejar imágenes en el mismo endpoint
router.post('/new', upload.array('images', 10), createUser);

// router.post('/uploadImg', upload.array('images', 10), uploadImgs); // Permite hasta 10 imágenes

module.exports = router;