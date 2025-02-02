// controllers/actor.controller.js
const runDatabaseOperation = require('../BD/dbconnection'); // Importar la función de conexión
const serviceMovies = require('../services/movies.service');

exports.getAllMovies = async (req, res) => {
    try {
        await runDatabaseOperation(async (db) => {
            const collection = db.collection('movies');
            const movies = await collection.find({ activo: true }, { projection: { _id: 0 } }).toArray();

            res.status(200).json({
                message: 'Peliculas obtenidas exitosamente',
                movies: movies,
            });
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las peliculas',
            error: error.message,
        });
    }
};

exports.getMoviesWithPagination = async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0; // Desde dónde empezar
        const limit = parseInt(req.query.limit) || 10; // Cantidad de películas a obtener

        await runDatabaseOperation(async (db) => {
            const collection = db.collection('movies');
            const movies = await collection
                .find({}, { projection: { _id: 0 } }) // Excluye _id
                .skip(offset) // Salta los primeros 'offset' registros
                .limit(limit) // Obtiene hasta 'limit' registros
                .toArray();

            const totalMovies = await collection.countDocuments(); // Cuenta total de películas

            res.status(200).json({
                message: 'Películas obtenidas exitosamente',
                totalMovies,
                offset,
                limit,
                movies,
            });
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las películas',
            error: error.message,
        });
    }
};


exports.getMovieByName = async (req, res) => {
    const movieName = req.params.name;
    console.log(movieName);
    try {
        await runDatabaseOperation(async (db) => {
            const collection = db.collection('movies');
            const movie = await collection.findOne({ titulo: movieName }, { projection: { _id: 0 } });

            if (!movie) {
                return res.status(404).json({
                    message: 'Pelicula no encontrada',
                });
            }

            res.status(200).json({
                message: 'Pelicula obtenida exitosamente',
                movie: movie,
            });
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener la pelicula',
            error: error.message,
        });
    }
};

exports.getTopRatedMovies = async (req, res) => {
    try {
        await runDatabaseOperation(async (db) => {
            const collection = db.collection('movies');
            const topMovies = await collection
                .find({}, { projection: { _id: 0 } }) // Excluir _id
                .sort({ calificacion: -1 }) // Ordenar de mayor a menor
                .limit(10) // Obtener solo el Top 10
                .toArray();

            res.status(200).json({
                message: 'Top 10 películas mejor calificadas',
                movies: topMovies,
            });
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el top de películas',
            error: error.message,
        });
    }
};

exports.buscarPeliculas = async  (req, res) =>{
    const { peliculas } = req.body;
  
    try {
      await runDatabaseOperation(async (db) => {
        const collection = db.collection('movies');
  
  
        const peliculasEncontradas = await collection.find({ titulo: { $in: peliculas } }).toArray();

  
        res.status(200).json({
          message: peliculasEncontradas.length > 0 ? 'Películas encontradas' : 'No se encontraron películas',
          peliculas: peliculasEncontradas
        });
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al buscar películas',
        error: error.message
      });
    }
  };
  
  
  
  
exports.createMovie = async (req, res) => {
    const movie = req.body;
    const images = req.files;

    // Transforma los campos ano_lanzamiento y calificacion a números
    movie.ano_lanzamiento = parseInt(movie.ano_lanzamiento);
    movie.calificacion = parseFloat(movie.calificacion);

    try {
        const response = await serviceMovies.createMovie(movie, images);
        console.log(response);
        if (response instanceof Error || !response.success) {
            return res.status(500).json({
                message: 'Error al crear la película',
                error: response.message,
            });
        }

        res.status(201).json({
            message: 'Película creada exitosamente',
            movie: response.movie,
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al crear la película',
            error: error.message,
        });
    }
};


exports.updateMovie = async (req, res) => {
    const movieName = req.params.name;
    const updatedMovie = req.body;
    const images = req.files;

    // Transforma los campos ano_lanzamiento y calificacion a números
    updatedMovie.ano_lanzamiento = parseInt(updatedMovie.ano_lanzamiento);
    updatedMovie.calificacion = parseFloat(updatedMovie.calificacion);

    try {
        const response = await serviceMovies.updateMovie(movieName, updatedMovie, images);
        console.log(response);
        if (response instanceof Error || !response.success) {
            return res.status(500).json({
                message: 'Error al actualizar la pelicula',
                error: response.message,
            });
        }

        res.status(200).json({
            message: 'Pelicula actualizada exitosamente',
            movie: response,
        });
        
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar la pelicula',
            error: error.message,
        });
        
    }
};

exports.softDeleteMovie = async (req, res) => {
    const movieName = req.body.nombre; // Nombre de la pelicula que se va a "eliminar"
  
    await runDatabaseOperation(async (db) => {
      const actorCollection = db.collection("actors");
      const movieCollection = db.collection("movies");
  
      // Buscar la pelicula que queremos eliminar
      const movie = await movieCollection.findOne({ titulo: movieName, activo: true });
      if (!movie) {
        return res.status(404).json({ message: "No se encontró la pelicula con ese nombre" });
      }
  
      // Marcar la pelicula como inactiva
      await movieCollection.updateOne(
        { titulo: movieName },
        { $set: { activo: false } }
      );
  
      // Eliminar la pelicula de los actores que son su reparto
      await actorCollection.updateMany( //actorCollection
        { peliculas: { $in: [movieName] } }, // Buscar actores que contengan a la pelicula en "peliculas"
        { $pull: { peliculas: movieName } }  // Eliminar la pelicula del array "peliculas"
    );
  
      // Enviar respuesta al cliente
      res.status(200).json({
        message: "Pelicula eliminada lógicamente y eliminado de los actores",
        movie,
      });
    });
  };
