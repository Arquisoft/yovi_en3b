import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HistoryPage from  '../components/HistoryPage/HistoryPage';
import { SettingsProvider } from '../context/SettingsContext';

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
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <SettingsProvider>
        <HistoryPage />
      </SettingsProvider>
    </MemoryRouter>
  );

  test('renders history content and mock matches', () => {
    renderComponent();
    
    // Verificar título
    expect(screen.getByText('HISTORIAL')).toBeDefined();
    
    // Verificar que se renderizan las estadísticas (ej. PARTIDAS)
    expect(screen.getByText('PARTIDAS')).toBeDefined();
    
    // Verificar que aparecen los oponentes del Mock Data
    expect(screen.getAllByText(/Bot Chip/i)).toHaveLength(2);
    expect(screen.getByText(/Bot Robot/i)).toBeDefined();
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

  test('calculates and displays the correct win rate', () => {
    renderComponent();
    
    // Con 4 partidas y 3 victorias (según tus mock data), el win rate es 75%
    expect(screen.getByText('75%')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined(); // Total partidas
    expect(screen.getByText('3')).toBeDefined(); // Victorias
  });
});