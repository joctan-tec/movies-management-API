const { uploadImgs } = require('../controllers/img.controller');
const runDatabaseOperation = require('../BD/dbconnection');


exports.createMovie = async (movie = {}, images = []) => {
    try {
        if (!movie.titulo) {
            throw new Error('El título de la película es requerido');
        }

        let imageLinks = [];
        if (images && images.length > 0) {
            const folder = `public/images/movies`;
            const results = await uploadImgs(images, folder);

            if (results instanceof Error) {
                throw new Error('Error al subir las imágenes');
            }

            const imagesPrefix = process.env.BUCKET_IMAGES_PREFIX;
            results.forEach((result) => {
                if (result.status === 'success') {
                    imageLinks.push(`${imagesPrefix}${result.data.path}`);
                }
            });
        }

        const newMovie = await runDatabaseOperation(async (db) => {
            const moviesCollection = db.collection('movies');
            const existingMovie = await moviesCollection.findOne({ titulo: movie.titulo });

            if (existingMovie) {
                throw new Error('La película ya existe');
            }

            const movieData = {
                ...movie,
                imagenes: imageLinks,
                createdAt: new Date(),
            };

            await moviesCollection.insertOne(movieData);

            return { success: true, message: 'Película creada con éxito', movie: movieData };
        });

        return { success: true, message: 'Película creada con éxito', movie: newMovie };
    } catch (error) {
        return { success: false, message: `Error en la operación de la base de datos: ${error.message}` };
    }
};


exports.updateMovie = async (movieName, movie = {}, images = []) => {
    try {
        if (!movieName) {
            throw new Error('El título de la película es requerido');
        }

        let newImageLinks = [];
        if (images && images.length > 0) {
            const folder = `public/images/movies`;
            const results = await uploadImgs(images, folder);

            if (results instanceof Error) {
                throw new Error('Error al subir las imágenes');
            }

            const imagesPrefix = process.env.BUCKET_IMAGES_PREFIX;
            results.forEach((result) => {
                if (result.status === 'success') {
                    newImageLinks.push(`${imagesPrefix}${result.data.path}`);
                }
            });
        }

        // Conectar a la base de datos y actualizar la película en MongoDB
        const updatedMovie = await runDatabaseOperation(async (db) => {
            const moviesCollection = db.collection('movies');
            const existingMovie = await moviesCollection.findOne({ titulo: movieName });

            if (!existingMovie) {
                throw new Error('La película no existe');
            }

            const updatedData = {
                ...existingMovie,
                ...movie,
                imagenes: [...(existingMovie.imagenes || []), ...newImageLinks],
            };

            await moviesCollection.findOneAndUpdate(
                { titulo: movieName },
                { $set: updatedData },
                { returnDocument: 'after' }
            );

            return { success: true, message: 'Película actualizada con éxito', movie: updatedData };
        });

        return { success: true, message: 'Película actualizada con éxito', movie: updatedMovie };
    } catch (error) {
        return { success: false, message: `Error en la operación de la base de datos: ${error.message}` };
    }
};


