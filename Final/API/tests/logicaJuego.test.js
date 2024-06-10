const { eleccionNumero, _getPokemonInfo, eleccionEquipo, crearJuego, obtenerInfoJuego, actualizarSecuencia } = require('../src/servicios/logicaJuego');
const axios = require('axios');
const Game = require('../src/models/juegoModel');

jest.mock('axios');
jest.mock('../src/models/juegoModel');

describe('Funciones de logicaJuego', () => {
    // Pruebas para eleccionNumero
    it('eleccionNumero debe devolver un número dentro del rango especificado', () => {
        const num = eleccionNumero(5, 15);
        expect(num).toBeGreaterThanOrEqual(5);
        expect(num).toBeLessThanOrEqual(15);
    });

    it('eleccionNumero debe lanzar un error si el rango es inválido', () => {
        expect(() => eleccionNumero(15, 5)).toThrow('Rango inválido: inicio es mayor que fin');
    });

    // Pruebas para _getPokemonInfo
    it('_getPokemonInfo debe devolver los datos correctos del Pokémon', async () => {
        const mockData = {
            data: {
                id: 25,
                name: 'pikachu',
                sprites: { front_default: 'pikachu.png' }
            }
        };
        axios.get.mockResolvedValue(mockData);
        const data = await _getPokemonInfo(25);
        expect(data).toEqual({ identificador: 25, nombre: 'pikachu', imagenUrl: 'pikachu.png' });
    });

    it('_getPokemonInfo debe manejar el error si la llamada a la API falla', async () => {
        axios.get.mockRejectedValue(new Error('Error al llamar a la API'));
        await expect(_getPokemonInfo(25)).rejects.toThrow('Error al llamar a la API');
    });

    // Pruebas para eleccionEquipo
    it('eleccionEquipo debe devolver un array de información de los Pokémon', async () => {
        const mockData = {
            data: {
                id: 1,
                name: 'bulbasaur',
                sprites: { front_default: 'bulbasaur.png' }
            }
        };
        axios.get.mockResolvedValue(mockData);
        const equipo = await eleccionEquipo([1, 4, 7, 10, 13, 16]);
        expect(equipo).toHaveLength(6);
        expect(equipo[0]).toEqual({ identificador: 1, nombre: 'bulbasaur', imagenUrl: 'bulbasaur.png' });
    });

    it('eleccionEquipo debe lanzar un error si una de las llamadas a la API falla', async () => {
        axios.get.mockRejectedValueOnce(new Error('Error al llamar a la API'));
        await expect(eleccionEquipo([1, 4, 7, 10, 13, 16])).rejects.toThrow('Error al llamar a la API');
    });

    // Pruebas para crearJuego
    it('crearJuego debe crear y devolver un juego', async () => {
        const mockGame = { _id: 'abc123', initialTeam: [1, 4, 7, 10, 13, 16], pokemonSequence: [] };
        Game.prototype.save = jest.fn().mockResolvedValue(mockGame);
        const juego = await crearJuego([1, 4, 7, 10, 13, 16]);
        expect(juego).toEqual(mockGame);
    });

    it('crearJuego debe lanzar un error si falla al guardar el juego', async () => {
        Game.prototype.save = jest.fn().mockRejectedValue(new Error('Error al guardar'));
        await expect(crearJuego([1, 4, 7, 10, 13, 16])).rejects.toThrow('Error al guardar');
    });

    // Pruebas para obtenerInfoJuego
    it('obtenerInfoJuego debe devolver la información del juego', async () => {
        const mockGame = { _id: 'abc123', initialTeam: [1, 4, 7, 10, 13, 16], pokemonSequence: [] };
        Game.findById = jest.fn().mockResolvedValue(mockGame);
        const juego = await obtenerInfoJuego('abc123');
        expect(juego).toEqual(mockGame);
    });

    it('obtenerInfoJuego debe lanzar un error si no se encuentra el juego', async () => {
        Game.findById = jest.fn().mockResolvedValue(null);
        await expect(obtenerInfoJuego('abc123')).rejects.toThrow('Juego no encontrado');
    });

    // Pruebas para actualizarSecuencia
    it('actualizarSecuencia debe actualizar la secuencia del juego', async () => {
        const mockUpdatedGame = {
            _id: 'abc123',
            initialTeam: [1, 4, 7, 10, 13, 16],
            pokemonSequence: [1, 4]
        };
        Game.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedGame);
        const result = await actualizarSecuencia('abc123', 4);
        expect(result).toEqual(mockUpdatedGame);
    });

    it('actualizarSecuencia debe lanzar un error si la actualización falla', async () => {
        Game.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error al actualizar'));
        await expect(actualizarSecuencia('abc123', 4)).rejects.toThrow('Error al actualizar');
    });
});
