import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HistoryPage from  '../components/HistoryPage/HistoryPage';
import { SettingsProvider } from '../context/SettingsContext';
import { getMyMatchHistory } from '../components/HistoryPage/history.api';

const mockNavigate = vi.fn(); // Mock for navigation

// 1. Mock de React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. Mock de Traducciones (ajustado a tu estructura de locales)
vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    t: {
      buttons: {
        history: 'HISTORIAL',
        victory: 'VICTORIA',
        defeat: 'DERROTA',
      },
      labels: {
        vs: 'contra',
      },
    },
  }),
}));

vi.mock('../components/HistoryPage/history.api', () => ({
  getMyMatchHistory: vi.fn(),
}));

// 3. Mock Global de Audio (para evitar el error de constructor)
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    volume: 1,
    muted: false,
  };
}));

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpiar historial de navegación antes de cada test
    vi.mocked(getMyMatchHistory).mockResolvedValue([
      { id: '1', date: '2024-03-20T00:00:00.000Z', result: 'win', size: 5, opponent: 'Bot Easy', isBot: true, opponentAvatarId: null, status: 'finished' },
      { id: '2', date: '2024-03-19T00:00:00.000Z', result: 'lose', size: 7, opponent: 'Bot Medium', isBot: true, opponentAvatarId: null, status: 'finished' },
      { id: '3', date: '2024-03-18T00:00:00.000Z', result: 'win', size: 5, opponent: 'Bot Easy', isBot: true, opponentAvatarId: null, status: 'finished' },
      { id: '4', date: '2024-03-17T00:00:00.000Z', result: 'win', size: 6, opponent: 'Bot Hard', isBot: true, opponentAvatarId: null, status: 'finished' },
    ]);
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <SettingsProvider>
        <HistoryPage />
      </SettingsProvider>
    </MemoryRouter>
  );

  test('renders history content and fetched matches', async () => {
    renderComponent();
    
    expect(screen.getByText('HISTORIAL')).toBeDefined();
    expect(await screen.findByText('PARTIDAS')).toBeDefined();
    expect(screen.getAllByText(/Bot Easy/i)).toHaveLength(2);
    expect(screen.getByText(/Bot Medium/i)).toBeDefined();
  });

  test('navigates back to menu when clicking the back button', () => {
    renderComponent();
    
    // Buscamos el botón por el icono (ArrowLeft) o la clase
    const backBtn = document.querySelector('.icon-btn-back');
    if (!backBtn) throw new Error('Back button not found');
    
    fireEvent.click(backBtn);
    
    // Verificar que se llamó a navigate con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });

  test('calculates and displays the correct win rate', async () => {
    renderComponent();
    expect(await screen.findByText('75%')).toBeDefined();
    expect(await screen.findByText('4')).toBeDefined();
    expect(await screen.findByText('3')).toBeDefined();
  });
}); 
