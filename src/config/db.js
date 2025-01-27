// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar el módulo de Firebase
const { initializeApp } = require('firebase/app');



// Configuración de Firebase utilizando las variables de entorno
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);



// Exportar las instancias de Firestore, Auth y Storage
module.exports = { app };