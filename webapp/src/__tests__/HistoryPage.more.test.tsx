import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HistoryPage from '../components/HistoryPage/HistoryPage';
import { getMyMatchHistory } from '../components/HistoryPage/history.api';

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

vi.mock('../context/SettingsContext', () => ({
  useSettings: () => mockSettings,
}));

vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    t: {
      buttons: {
        history: 'HISTORY',
        victory: 'VICTORY',
        defeat: 'DEFEAT',
      },
      labels: {
        vs: 'vs',
      },
    },
  }),
}));

vi.mock('../components/HistoryPage/history.api', () => ({
  getMyMatchHistory: vi.fn(),
}));

describe('HistoryPage additional states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.colorBlindMode = true;
    mockSettings.neonMode = true;
  });

  it('shows the loading state with the enabled visual modes', () => {
    vi.mocked(getMyMatchHistory).mockReturnValue(new Promise(() => {}));

    const { container, unmount } = render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
    expect(container.querySelector('.history-container')).toHaveClass('color-blind');
    expect(container.querySelector('.history-container')).toHaveClass('neon-mode');

    unmount();
  });

  it('renders the backend error message when loading fails with an Error', async () => {
    vi.mocked(getMyMatchHistory).mockRejectedValueOnce(new Error('Broken history'));

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Broken history')).toBeInTheDocument();
  });

  it('falls back to the default error message for non-Error failures', async () => {
    vi.mocked(getMyMatchHistory).mockRejectedValueOnce('boom');

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Could not load match history')).toBeInTheDocument();
  });

  it('shows the empty state and zeroed statistics when there are no matches', async () => {
    vi.mocked(getMyMatchHistory).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('No matches recorded yet.')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2);
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

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('LOSE')).toBeInTheDocument();
    expect(screen.getByText('LOSE')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('ignores a successful history response that resolves after unmount', async () => {
    let resolveHistory: ((value: Parameters<typeof Promise.resolve>[0]) => void) | undefined;
    const historyPromise = new Promise((resolve) => {
      resolveHistory = resolve;
    });

    vi.mocked(getMyMatchHistory).mockReturnValueOnce(historyPromise as ReturnType<typeof getMyMatchHistory>);

    const { unmount } = render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

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

    vi.mocked(getMyMatchHistory).mockReturnValueOnce(historyPromise as ReturnType<typeof getMyMatchHistory>);

    const { unmount } = render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    unmount();

    await act(async () => {
      rejectHistory?.(new Error('late failure'));
      await Promise.resolve();
    });
  });
});
