const jwt = require('jsonwebtoken');
const { loginAuthUser, getUserData } = require('../services/user.service');
require('dotenv').config();





// Login: Generar un token para un usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'El email y la contraseña son requeridos' });
    }

    const user = await loginAuthUser(email, password);

    if (!user) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const userData = await getUserData(user.uid);

    console.log("USER DATA: ", userData);

    if (!userData) {
        return res.status(401).json({ message: 'Error al obtener los datos del usuario' });
    }

    // Crear un token con la información del usuario
    const expiresIn = parseInt(process.env.JWT_EXPIRES_IN, 10); // Convertir a número

    const token = jwt.sign(
        { id: userData.id, username: userData.userName, email: userData.email, role: userData.role, picture: userData.pictureLink[0] },
        process.env.JWT_SECRET,
        { expiresIn: expiresIn } // Duración en segundos
    );
    
    // Configurar la cookie con la misma duración que el token
    res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10), // Duración en milisegundos
    });

    // Responder al cliente
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
};


exports.getUserInfo = (req, res) => {
    // Usa la información ya decodificada del token en `req.user`
    const { username, email, role, picture } = req.user;

    // Responde con los datos necesarios
    res.status(200).json({ username, email, role, picture });
};