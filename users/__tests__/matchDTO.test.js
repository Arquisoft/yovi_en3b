import { describe, it, expect } from 'vitest';
// Ajusta la ruta si es necesario basándote en la estructura de tus tests
import { toMatchResponseDto, toMatchInputDto } from '../src/modules/match/domain/matchDTO.js';

describe('matchDTO', () => {
  // Objeto simulado con todos los campos, incluyendo "basura" extra
  const mockMatch = {
    bluePlayerId: 'user-123',
    redPlayerId: 'user-456',
    isBot: false,
    botDifficulty: null,
    status: 'finished',
    winner_id: 'user-123',
    ended_at: '2024-03-20T10:00:00Z',
    campoSecretoDB: 'no-deberia-mostrarse', // Simulamos un campo que el DTO debe filtrar
    passwordHash: '123456' 
  };

  describe('toMatchResponseDto', () => {
    it('debería mapear correctamente un objeto match a un DTO de respuesta', () => {
      const result = toMatchResponseDto(mockMatch);

      expect(result).toEqual({
        bluePlayerId: 'user-123',
        redPlayerId: 'user-456',
        isBot: false,
        botDifficulty: null,
        status: 'finished',
        winner_id: 'user-123',
        ended_at: '2024-03-20T10:00:00Z'
      });

      // Comprobamos que efectivamente ignora los campos extra
      expect(result).not.toHaveProperty('campoSecretoDB');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('debería manejar objetos vacíos sin crashear (campos a undefined)', () => {
      const result = toMatchResponseDto({});

      expect(result).toEqual({
        bluePlayerId: undefined,
        redPlayerId: undefined,
        isBot: undefined,
        botDifficulty: undefined,
        status: undefined,
        winner_id: undefined,
        ended_at: undefined
      });
    });
  });

  describe('toMatchInputDto', () => {
    it('debería mapear correctamente un objeto match a un DTO de entrada', () => {
      const result = toMatchInputDto(mockMatch);

      expect(result).toEqual({
        bluePlayerId: 'user-123',
        redPlayerId: 'user-456',
        isBot: false,
        botDifficulty: null,
        status: 'finished',
        winner_id: 'user-123',
        ended_at: '2024-03-20T10:00:00Z'
      });

      expect(result).not.toHaveProperty('campoSecretoDB');
    });
  });
});