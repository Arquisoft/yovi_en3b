
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainMenu from '../components/MainMenu';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    user: { nickname: 'Tester', avatarId: 'avatar_01' },
    loading: false,
    error: null,
    updateNickname: vi.fn(),
  }),
}));

vi.mock('../components/UserProfile/ProfileOverlay', () => ({
  ProfileOverlay: () => null,
}));

vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    language: 'es',
    setLanguage: vi.fn(),
    t: {
      buttons: {
        language: 'Idioma',
        settings: 'Configuración',
        profile: 'Perfil',
        logout: 'Cerrar sesión',
        play: 'JUGAR',
        howToPlay: 'CÓMO JUGAR',
        overallRanking: 'RANKING GENERAL',
        easy: 'FÁCIL',
        medium: 'MEDIO',
        hard: 'DIFÍCIL',
        exit: 'SALIR',
        cancel: 'CANCELAR',
      },
      labels: {
        selectLevel: 'SELECCIONA NIVEL',
      },
      messages: {
        loading: 'CARGANDO...',
      },
    },
  }),
}));

describe('MainMenu Spanish branch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows Spanish logout confirmation copy', () => {
    render(
      <MemoryRouter>
        <MainMenu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTitle(/Cerrar sesión/i));

    expect(screen.getByText(/¿Seguro que quieres cerrar sesión\?/i)).toBeDefined();
    expect(screen.getByText(/SÍ, CERRAR SESIÓN/i)).toBeDefined();
  });
});
