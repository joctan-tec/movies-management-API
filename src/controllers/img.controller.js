const { saveImage, imageLink } = require('../services/storage.service');
const path = require('path'); // Para manejar extensiones

// Descargar una imagen desde el almacenamiento
exports.imageLink = async (req, res) => {
  const { folder, fileName } = req.params;
  const { data, error } = await imageLink(folder, fileName);

  if (error) {
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'No se encontró la imagen' });
  }

  res.status(200).json({ data });
};

exports.uploadImgs = async (files, folder) => {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']; // Extensiones válidas
  const results = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();

    // Validar la extensión del archivo
    if (!validExtensions.includes(ext)) {
      results.push({
        file: file.originalname,
        status: 'error',
        details: `Extensión no válida: ${ext}`,
      });
      continue;
    }

    // Generar un nombre único para el archivo
    const fileName = generateUUID(file.originalname);

    // Subir el archivo al almacenamiento
    const { data, error } = await saveImage(file.buffer, folder, fileName);

    if (error) {
      results.push({ file: file.originalname, status: 'error', details: error });
    } else {
      results.push({ file: file.originalname, newName: fileName, status: 'success', data });
    }
  }

  return results;
};

// Generar un nombre único con la extensión original
const generateUUID = (originalName) => {
  const ext = path.extname(originalName).toLowerCase(); // Obtener la extensión
  return `${require('uuid').v4()}${ext}`; // Concatenar UUID con la extensión
};