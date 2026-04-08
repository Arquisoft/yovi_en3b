import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RankingScreen from '../components/RankingScreen/RankingScreen';
import { getGlobalRanking } from '../components/RankingScreen/ranking.api';

const mockOnClose = vi.fn();
const mockPlaySound = vi.fn();

vi.mock('../components/RankingScreen/ranking.api', () => ({
  getGlobalRanking: vi.fn(),
}));

vi.mock('../context/SettingsContext', () => ({
  useSettings: () => ({
    playSound: mockPlaySound,
  }),
}));

vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    t: {
      labels: {
        rankingTitle: 'OVERALL RANKING',
        position: 'POSITION',
        user: 'USER',
        winRate: 'WIN %',
        lastGame: 'LAST GAME',
      },
    },
  }),
}));

describe('RankingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ranking data and handles close interactions', async () => {
    vi.mocked(getGlobalRanking).mockResolvedValue([
      {
        id: 'u1',
        position: 1,
        username: 'champ',
        displayName: 'Champion',
        avatarId: 'avatar_01',
        points: 500,
        winRate: 90,
        gamesPlayed: 10,
        lastGameWon: true,
      },
      {
        id: 'u2',
        position: 2,
        username: 'runnerup',
        displayName: 'Runner Up',
        avatarId: 'avatar_02',
        points: 400,
        winRate: 80,
        gamesPlayed: 11,
        lastGameWon: false,
      },
      {
        id: 'u3',
        position: 3,
        username: 'third',
        displayName: 'Third Place',
        avatarId: 'avatar_03',
        points: 300,
        winRate: 70,
        gamesPlayed: 12,
        lastGameWon: true,
      },
      {
        id: 'u4',
        position: 4,
        username: 'contender',
        displayName: 'Contender',
        avatarId: 'avatar_04',
        points: 250,
        winRate: 60,
        gamesPlayed: 13,
        lastGameWon: false,
      },
    ]);

    render(<RankingScreen onClose={mockOnClose} />);

    expect(screen.getByText('Loading ranking...')).toBeInTheDocument();
    expect(await screen.findByText('Champion')).toBeInTheDocument();
    expect(screen.getByText('@champ')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockPlaySound).toHaveBeenCalledWith('click.mp3');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders an empty state when there is no ranking data', async () => {
    vi.mocked(getGlobalRanking).mockResolvedValue([]);

    render(<RankingScreen onClose={mockOnClose} />);

    expect(await screen.findByText('No ranking data available yet.')).toBeInTheDocument();
  });

  it('renders an error message when loading fails', async () => {
    vi.mocked(getGlobalRanking).mockRejectedValue(new Error('Broken ranking'));

    render(<RankingScreen onClose={mockOnClose} />);

    expect(await screen.findByText('Broken ranking')).toBeInTheDocument();
  });
});
