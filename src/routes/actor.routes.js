const express = require('express');
const { createActor } = require('../controllers/actor.controller');
const router = express.Router();

router.post('/create', createActor);

module.exports = router;