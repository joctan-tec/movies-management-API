const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const app = express();
const actorRoutes = require('./routes/actor.routes');

// Middlewares globales
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas
app.use('/api', routes);
app.use('/api/actors', actorRoutes);

module.exports = app;