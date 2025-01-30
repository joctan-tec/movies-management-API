const express = require('express');
const { getAllMovies, getMovieByName, getMoviesWithPagination, getTopRatedMovies } = require('../controllers/movies.controller');

const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/all', getAllMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/', getMoviesWithPagination);
router.get('/:name', getMovieByName);




module.exports = router;