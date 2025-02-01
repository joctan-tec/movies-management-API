const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();
require('dotenv').config();
app.use(cookieParser());



// Middlewares globales
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200',  // Origen permitido (frontend)
    credentials: true  // Permite enviar cookies
  }));
app.use(morgan('dev'));

// Rutas
app.use('/api', routes);

module.exports = app;