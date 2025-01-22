const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guarda la información del usuario en la request
        next(); // Continúa con la siguiente función o ruta
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
};

module.exports = verifyToken;