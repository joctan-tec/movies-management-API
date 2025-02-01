const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    // Prioridad: buscar token en el header Authorization
    let token = req.headers['authorization'];

    // Si no hay token en el header, buscar en las cookies
    if (!token) {
        token = req.cookies?.authToken; // Requiere cookie-parser configurado
    }

    console.log('Token:', token);

    // Si no se encuentra en ninguna parte, devolver un error
    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    // Si el token está en el header, eliminar el prefijo "Bearer" si existe
   if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remueve "Bearer "
    }
    
    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjuntar datos del usuario a la request
        next(); // Continuar con la siguiente función o ruta

    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
};

module.exports = verifyToken;
