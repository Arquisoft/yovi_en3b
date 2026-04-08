import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainMenu from '../components/MainMenu';
import { SettingsProvider } from '../context/SettingsContext';

const mockNavigate = vi.fn(); // Mock for navigation 

// Mock navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate }; 
});

// Mock User Profile hook
vi.mock('../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    user: { nickname: 'Tester', avatarId: 'avatar_01' },
    loading: false,
    error: null,
    updateNickname: vi.fn(),
  }),
}));

// Mock child components
vi.mock('../components/UserProfile/ProfileOverlay', () => ({
  ProfileOverlay: ({ open }: { open: boolean }) => open ? <div data-testid="profile-overlay">Profile Overlay</div> : null,
}));

vi.mock('../components/Settings/SettingsModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="settings-modal">
      <button onClick={onClose}>Close Settings</button> 
    </div>
  ),
}));

// FIX: Mock GamePreviewModal to directly trigger onStart for the test
vi.mock('../components/GamePreviewModal/GamePreviewModal', () => ({
  default: ({ isOpen, onStart }: { isOpen: boolean, onStart: (s: any) => void }) => 
    isOpen ? (
      <div data-testid="preview-modal">
        <button onClick={() => onStart({ difficulty: 'medium' })}>START GAME MOCK</button>
      </div>
    ) : null,
}));

// Translations Mock
vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    language: 'es',
    setLanguage: vi.fn(),
    t: {
      buttons: {
        language: 'Idioma', settings: 'Configuración', profile: 'Perfil',
        logout: 'Cerrar sesión', play: 'JUGAR', howToPlay: 'CÓMO JUGAR',
        overallRanking: 'RANKING GENERAL', confirmLogout: 'CERRAR SESIÓN',
        stayHere: 'QUEDARSE', understood: 'ENTENDIDO',
      },
      labels: {
        selectLevel: 'SELECCIONA NIVEL', rankingTitle: 'RANKING GLOBAL', preview: 'PREVISUALIZACIÓN',
      },
      messages: {
        loading: 'CARGANDO...', logoutConfirmation: '¿Estás seguro de que quieres cerrar sesión?',
      },
      instructions: {
        step1Title: 'Paso 1', step1Text: 'Texto 1', step2Title: 'Paso 2', step2Text: 'Texto 2', step3Title: 'Paso 3', step3Text: 'Texto 3',
      }
    },
  }),
}));

// Mock Audio
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    loop: false,
    volume: 1,
    muted: false,
    load: vi.fn(),
  };
}));

describe('MainMenu Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear call history before each test
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <SettingsProvider>
        <MainMenu />
      </SettingsProvider>
    </MemoryRouter>
  );

  test('renders main buttons correctly', () => {
    renderComponent();
    expect(screen.getByText('JUGAR')).toBeDefined();
    expect(screen.getByText('CÓMO JUGAR')).toBeDefined();
    expect(screen.getByText('RANKING GENERAL')).toBeDefined();
  });

  test('navigates to game via GamePreviewModal', () => {
    renderComponent();
    
    // 1. Abrir el modal
    fireEvent.click(screen.getByText('JUGAR'));
    
    // 2. Hacer clic en el botón de nuestro MODAL MOCKEADO
    const startBtn = screen.getByText('START GAME MOCK');
    fireEvent.click(startBtn);
    
    // 3. Verificar navegación
    expect(mockNavigate).toHaveBeenCalledWith('/game', expect.objectContaining({
        state: expect.any(Object)
    }));
  });

  test('handles logout process correctly', () => {
    renderComponent();
    const logoutBtn = screen.getByTitle(/Cerrar sesión/i);
    
    fireEvent.click(logoutBtn);
    expect(screen.getByText(/¿Estás seguro de que quieres cerrar sesión\?/i)).toBeDefined();

    const confirmBtn = screen.getByText('CERRAR SESIÓN');
    fireEvent.click(confirmBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('toggles Settings modal', () => {
    renderComponent();
    const settingsBtn = screen.getByTitle(/Configuración/i);
    
    fireEvent.click(settingsBtn);
    expect(screen.getByTestId('settings-modal')).toBeDefined();

    fireEvent.click(screen.getByText('Close Settings'));
    expect(screen.queryByTestId('settings-modal')).toBeNull();
  });
});