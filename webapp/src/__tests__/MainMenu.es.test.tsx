
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainMenu from '../components/MainMenu';
import { SettingsProvider } from '../context/SettingsContext';

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
        confirmLogout: 'CERRAR SESIÓN',
      },
      labels: {
        selectLevel: 'SELECCIONA NIVEL',
      },
      messages: {
        loading: 'CARGANDO...',
        logoutConfirmation: '¿Estás seguro de que quieres cerrar sesión?',
      },
    },
  }),
}));

/**
 * Global mock for the Web Audio API.
 * JSDOM (the test environment) does not support audio playback. 
 * This stub replaces the native 'Audio' constructor with a fake object 
 * to prevent "TypeError: Audio is not a constructor" or ".play() is undefined" errors.
 */
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        catch: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        loop: false,
        volume: 1,
        muted: false
    };
}));

describe('MainMenu Spanish branch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows Spanish logout confirmation copy', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <MainMenu />
        </SettingsProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTitle(/Cerrar sesión/i));

    expect(screen.getByText(/¿Estás seguro de que quieres cerrar sesión\?/i)).toBeDefined();
    expect(screen.getByText("CERRAR SESIÓN")).toBeDefined();
  });
});
