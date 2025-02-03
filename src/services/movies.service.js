const { uploadImgs } = require('../controllers/img.controller');
const { runDatabaseOperation } = require('../BD/dbconnection');

exports.searchMovies = async (searchText, genreFilter, yearFilter, ratingFilter, page = 1, limit = 10) => {
    try {
        return await runDatabaseOperation(async (db) => {
            const moviesCollection = db.collection('movies');

            let matchStage = {};
            let sortStage = { ano_lanzamiento: -1, calificacion: -1 };

            if (searchText && searchText.trim() !== "") {
                matchStage.$text = { $search: searchText };
                sortStage = { textScore: { $meta: "textScore" }, ano_lanzamiento: -1 };
            }

            if (genreFilter && genreFilter.toLowerCase() !== "todos") {
                matchStage.genero = { $regex: new RegExp(`\\b${genreFilter}\\b`, "i") };
            }

            if (yearFilter && !isNaN(yearFilter)) {
                matchStage.ano_lanzamiento = {$gte: parseInt(yearFilter) };
            }

            if (ratingFilter && !isNaN(ratingFilter)) {
                matchStage.calificacion = { $gte: parseFloat(ratingFilter) };
            }

            const totalDocuments = await moviesCollection.countDocuments(matchStage);

            const aggregationPipeline = [
                { $match: matchStage },
                { $sort: sortStage },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                { $project: { _id: 0 } } // ❌ Excluye solo el campo "_id"
            ];

            const result = await moviesCollection.aggregate(aggregationPipeline).toArray();

            return {
                success: true,
                currentPage: page,
                totalPages: Math.ceil(totalDocuments / limit),
                totalResults: totalDocuments,
                movies: result
            };
        });
    } catch (error) {
        return {
            success: false,
            message: `Error en la operación de la base de datos: ${error.message}`
        };
    }
};






exports.getMovieInfo = async () => {
    try {
        return await runDatabaseOperation(async (db) => {
            const moviesCollection = db.collection('movies');

            const result = await moviesCollection.aggregate([
                // Proyectar los campos que necesitamos
                {
                    $project: {
                        ano_lanzamiento: 1, // Campo numérico
                        genero: { $split: ["$genero", ","] }, // Dividir el campo "genero" en un array
                        calificacion: 1 // Campo numérico
                    }
                },
                // Descomponer el array de géneros en documentos individuales
                { $unwind: "$genero" },
                // Limpiar espacios en blanco alrededor de los géneros
                {
                    $project: {
                        ano_lanzamiento: 1,
                        genero: { $trim: { input: "$genero", chars: " " } }, // Limpiar géneros
                        calificacion: 1
                    }
                },
                // Agrupar para obtener valores únicos de cada campo
                {
                    $group: {
                        _id: null,
                        anos_lanzamiento: { $addToSet: "$ano_lanzamiento" }, // Valores únicos de año
                        generos: { $addToSet: "$genero" }, // Valores únicos de género
                        calificaciones: { $addToSet: "$calificacion" } // Valores únicos de calificación
                    }
                },
                // Proyectar el resultado final
                {
                    $project: {
                        _id: 0,
                        anos_lanzamiento: 1,
                        generos: 1,
                        calificaciones: 1
                    }
                }
            ]).toArray();

            console.log(result);

            // Si no hay resultados, devolver arrays vacíos
            if (!result || result.length === 0) {
                return {
                    success: true,
                    anos_lanzamiento: [],
                    generos: [],
                    calificaciones: []
                };
            }

            responseObject = {
                success: true,
                anos_lanzamiento: result[0].anos_lanzamiento,
                generos: result[0].generos,
                calificaciones: result[0].calificaciones
            };

            console.log(responseObject);

            // Devolver el resultado
            return responseObject;
        });
    } catch (error) {
        return {
            success: false,
            message: `Error en la operación de la base de datos: ${error.message}`
        };
    }
};


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
                reparto: [],
                activo : true,
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


