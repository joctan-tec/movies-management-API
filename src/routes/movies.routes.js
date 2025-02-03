const express = require('express');
const { getAllMovies, getMovieByName, getMoviesWithPagination, getTopRatedMovies, updateMovie, createMovie, getMovieInfo, searchMovies, softDeleteMovie, buscarPeliculas } = require('../controllers/movies.controller');


const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/all', getAllMovies);
router.get('/search', searchMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/', getMoviesWithPagination);
router.get('/movies-info', getMovieInfo);
router.post('/movie', upload.array('imagenes', 10), createMovie);
router.get('/:name', getMovieByName);
router.post('/actorMovies',buscarPeliculas)
router.put('/movie/:name', upload.array('imagenes', 10), updateMovie);
router.patch('/delete',softDeleteMovie);




module.exports = router;