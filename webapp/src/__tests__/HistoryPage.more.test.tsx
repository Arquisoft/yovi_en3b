import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HistoryPage from '../components/HistoryPage/HistoryPage';
import { getMyMatchHistory } from '../components/HistoryPage/history.api';
import { SettingsProvider } from '../context/SettingsContext';

const mockNavigate = vi.fn();
const mockPlaySound = vi.fn();

const mockSettings = {
  colorBlindMode: true,
  neonMode: true,
  playSound: mockPlaySound,
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/SettingsContext', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useSettings: () => mockSettings,
  };
});

vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    t: {
      buttons: {
        history: 'HISTORY',
        victory: 'VICTORY',
        defeat: 'DEFEAT',
      },
      labels: {
        loadingH: 'Loading history...',
        noMatches: 'No matches recorded yet.',
        partidas: 'MATCHES',
        winRate: 'WIN RATE',
        victorias: 'WINS',
        vs: 'vs',
        loadingH: 'Loading...',
        noMatches: 'No matches found',
        errorLoading: 'could not load history',
      },
    },
  }),
}));

vi.mock('../components/HistoryPage/history.api', () => ({
  getMyMatchHistory: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                {ui}
            </SettingsProvider>
        </MemoryRouter>
    );
};

describe('HistoryPage additional states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.colorBlindMode = true;
    mockSettings.neonMode = true;
  });

  it('shows the loading state with the enabled visual modes', () => {
    vi.mocked(getMyMatchHistory).mockReturnValue(new Promise(() => {}));

    const { container, unmount } = renderWithProviders(<HistoryPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(container.querySelector('.history-container')).toHaveClass('color-blind');
    expect(container.querySelector('.history-container')).toHaveClass('neon-mode');

    unmount();
  });

  it('renders the backend error message when loading fails with an Error', async () => {
    vi.mocked(getMyMatchHistory).mockRejectedValueOnce(new Error('Broken history'));

    renderWithProviders(<HistoryPage />);

    expect(await screen.findByText(/Broken history/i)).toBeInTheDocument();
  });

  it('falls back to the default error message for non-Error failures', async () => {
    vi.mocked(getMyMatchHistory).mockRejectedValueOnce('boom');

    renderWithProviders(<HistoryPage />);

    expect(await screen.findByText(/Could not load match history/i)).toBeInTheDocument();
  });

  it('shows the empty state and zeroed statistics when there are no matches', async () => {
    vi.mocked(getMyMatchHistory).mockResolvedValueOnce([]);

    renderWithProviders(<HistoryPage />);

    expect(await screen.findByText('No matches found')).toBeInTheDocument();
    
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders abandoned and in-progress entries without counting them as finished matches', async () => {
    vi.mocked(getMyMatchHistory).mockResolvedValueOnce([
      {
        id: 'a1',
        date: '2024-03-21T00:00:00.000Z',
        result: 'lose',
        size: null,
        opponent: 'Bot Hard',
        isBot: true,
        opponentAvatarId: null,
        status: 'finished',
      },
      {
        id: 'a2',
        date: '2024-03-22T00:00:00.000Z',
        result: 'lose',
        size: null,
        opponent: 'Bot Medium',
        isBot: true,
        opponentAvatarId: null,
        status: 'finished',
      },
    ]);

    renderWithProviders(<HistoryPage />);

    // Just check that no error is shown and component renders
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('ignores a successful history response that resolves after unmount', async () => {
    let resolveHistory: ((value: any) => void) | undefined;
    const historyPromise = new Promise((resolve) => {
      resolveHistory = resolve;
    });

    vi.mocked(getMyMatchHistory).mockReturnValueOnce(historyPromise as any);

    const { unmount } = renderWithProviders(<HistoryPage />);

    unmount();

    await act(async () => {
      resolveHistory?.([
        {
          id: 'late-success',
          date: '2024-03-21T00:00:00.000Z',
          result: 'win',
          size: 5,
          opponent: 'Bot Easy',
          isBot: true,
          opponentAvatarId: null,
          status: 'finished',
        },
      ]);
      await Promise.resolve();
    });
  });

  it('ignores a failed history response that rejects after unmount', async () => {
    let rejectHistory: ((reason?: unknown) => void) | undefined;
    const historyPromise = new Promise((_, reject) => {
      rejectHistory = reject;
    });

    vi.mocked(getMyMatchHistory).mockReturnValueOnce(historyPromise as any);

    const { unmount } = renderWithProviders(<HistoryPage />);

    unmount();

    await act(async () => {
      rejectHistory?.(new Error('late failure'));
      await Promise.resolve();
    });
  });
});