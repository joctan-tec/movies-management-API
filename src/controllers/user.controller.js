const { User } = require('../models/user');
const UserService = require('../services/user.service');

exports.getAllUsers = (req, res) => {

  };


  
  exports.createUser = async (req, res) => {
    try {
      const userData = req.body;
      const images = req.files;
  
      // Crear el usuario en la base de datos
      const response = await UserService.createUser(userData, images);
  
      if (response instanceof Error) {
        return res.status(500).json({ error: 'Error interno del servidor', details: response.message });
      }
  
      const { email, userName } = userData;
  
      res.status(201).json({
        message: `Usuario creado: ${userName} (${email})`,
      });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
  };