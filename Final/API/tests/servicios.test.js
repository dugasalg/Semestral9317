const request = require('supertest');
const mongoose = require('mongoose');
const Game = require('../src/models/juegoModel');
const app = require('../src/app');

describe('API de Juego', () => {
    beforeAll(async () => {
        jest.setTimeout(30000); // Aumentar el tiempo límite para las pruebas

        await mongoose.connect('mongodb+srv://dugatabacc:bVfvoFf0WEUhFjm7@clusterulsa.l8kv3qi.mongodb.net/PokemonSalgadoGay', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Pruebas para crearJuego
    it('debe iniciar un nuevo juego', async () => {
        const response = await request(app).get('/crearJuego');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('idJuego');
        expect(response.body).toHaveProperty('equipoInicial');
    });

    it('debe devolver 500 si ocurre un error durante la inicialización del juego', async () => {
        jest.spyOn(Game.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Error al guardar en la base de datos');
        });

        const response = await request(app).get('/crearJuego');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error iniciando el juego: Error al guardar en la base de datos');
    });

    // Pruebas para enviarSecuencia
    it('debe comparar la secuencia correctamente', async () => {
        const newGameResponse = await request(app).get('/crearJuego');
        const idJuego = newGameResponse.body.idJuego;

        // Obtener el pokemon inicial de la respuesta
        const pokemonInicial = newGameResponse.body.equipoInicial[0].identificador;

        // Enviar la secuencia correcta
        const response = await request(app)
            .post('/enviarSecuencia')
            .send({ idJuego, pokemons: [pokemonInicial] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('resultado');
        
    });

    it('debe devolver 500 si ocurre un error durante la comparación de secuencias', async () => {
        const newGameResponse = await request(app).get('/crearJuego');
        const idJuego = newGameResponse.body.idJuego;

        jest.spyOn(Game, 'findById').mockImplementationOnce(() => {
            throw new Error('Error al buscar en la base de datos');
        });

        const response = await request(app)
            .post('/enviarSecuencia')
            .send({ idJuego, pokemons: [1] });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error comparando la secuencia: Error al buscar en la base de datos');
    });

    it('debe devolver 500 si el juego no se encuentra durante la comparación de secuencias', async () => {
        const newGameResponse = await request(app).get('/crearJuego');
        const idJuego = newGameResponse.body.idJuego;

        jest.spyOn(Game, 'findById').mockResolvedValueOnce(null);

        const response = await request(app)
            .post('/enviarSecuencia')
            .send({ idJuego, pokemons: [1] });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error comparando la secuencia: Juego no encontrado');
    });

    it('debe devolver 200 y TERMINADO si la secuencia es incorrecta', async () => {
        const newGameResponse = await request(app).get('/crearJuego');
        const idJuego = newGameResponse.body.idJuego;

        const response = await request(app)
            .post('/enviarSecuencia')
            .send({ idJuego, pokemons: [999] }); // Pokemon incorrecto

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('resultado', 'TERMINADO');
        expect(response.body).toHaveProperty('score');
    });


});
