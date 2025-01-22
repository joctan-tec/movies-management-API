

exports.getAllUsers = (req, res) => {
  res.send('Obteniendo todos los usuarios');
  };
  
exports.createUser = (req, res) => {
  const userData = req.body;
  res.status(201).send(`Usuario creado: ${JSON.stringify(userData)}`);
};

