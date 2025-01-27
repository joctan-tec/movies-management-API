const { imageLink } = require('../controllers/img.controller');
const express = require('express');

const router = express.Router();

router.get('/:folder/:fileName', imageLink);

module.exports = router;