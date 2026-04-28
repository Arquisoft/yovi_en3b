import { describe, it, expect } from 'vitest';
// Ajusta la ruta si es necesario basándote en la estructura de tus tests
import { toRankingResponseDto, toUserInputDto } from '../src/modules/ranking/domain/rankingDTO.js';

describe('rankingDTO', () => {
  // Objeto simulado con todos los campos, incluyendo passwords y "basura" extra
  const mockUser = {
    username: 'ProPlayer',
    email: 'pro@test.com',
    photo: 'avatar_01.png',
    nickname: 'ElPro',
    password: 'hashed_password_123',
    newPassword: 'new_hashed_password_456',
    campoSecretoDB: 'super-secret-token', // Basura que no debe salir
    rol: 'admin' // Más basura
  };

  describe('toRankingResponseDto', () => {
    it('debería mapear correctamente y ELIMINAR contraseñas y basura extra', () => {
      const result = toRankingResponseDto(mockUser);

      // El DTO de respuesta (lo que enviamos al Frontend) NUNCA debe llevar passwords
      expect(result).toEqual({
        username: 'ProPlayer',
        email: 'pro@test.com',
        photo: 'avatar_01.png',
        nickname: 'ElPro'
      });

      // Aseguramos que la criba funciona
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('newPassword');
      expect(result).not.toHaveProperty('campoSecretoDB');
      expect(result).not.toHaveProperty('rol');
    });

    it('debería manejar objetos vacíos sin crashear', () => {
      const result = toRankingResponseDto({});

      expect(result).toEqual({
        username: undefined,
        email: undefined,
        photo: undefined,
        nickname: undefined
      });
    });
  });

  describe('toUserInputDto', () => {
    it('debería mapear correctamente un objeto de entrada (incluyendo passwords)', () => {
      const result = toUserInputDto(mockUser);

      // El DTO de entrada (lo que entra al servicio) sí necesita los passwords
      expect(result).toEqual({
        username: 'ProPlayer',
        email: 'pro@test.com',
        photo: 'avatar_01.png',
        nickname: 'ElPro',
        password: 'hashed_password_123',
        newPassword: 'new_hashed_password_456'
      });

      // Pero sigue limpiando la basura inyectada
      expect(result).not.toHaveProperty('campoSecretoDB');
      expect(result).not.toHaveProperty('rol');
    });

    it('debería manejar objetos vacíos sin crashear', () => {
      const result = toUserInputDto({});

      expect(result).toEqual({
        username: undefined,
        email: undefined,
        photo: undefined,
        nickname: undefined,
        password: undefined,
        newPassword: undefined
      });
    });
  });
});