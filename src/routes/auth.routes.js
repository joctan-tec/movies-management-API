const express = require('express');
const { login, getUserInfo } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

const multer = require('multer');
const upload = multer();



const router = express.Router();

router.post('/login', upload.none(), login);
router.get('/getUserInfo', verifyToken, getUserInfo); // Aplica el middleware


module.exports = router;