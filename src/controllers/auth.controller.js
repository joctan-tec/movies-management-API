const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simulación de una base de datos de usuarios
const users = [
    { id: 1, username: 'admin', password: bcrypt.hashSync('123456', 8) }
];

// Login: Generar un token para un usuario
const login = (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN // Tiempo de expiración del token
    });

    res.json({ message: 'Login exitoso', token });
};

// Ejemplo de una ruta protegida
const protectedRoute = (req, res) => {
    res.json({ message: `Hola, ${req.user.username}. Esta es una ruta protegida.` });
};

module.exports = { login, protectedRoute };