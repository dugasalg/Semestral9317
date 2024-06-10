const express = require('express');
const router = express.Router();
const { iniciarJuego, compararSecuencia } = require('../controllers/juegoController');

// Definir las rutas de la API
router.get('/crearJuego', iniciarJuego);
router.post('/enviarSecuencia', compararSecuencia);

module.exports = router;
