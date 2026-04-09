import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getMyProfile } from '../components/UserProfile/userProfile.api';

vi.mock('../components/UserProfile/userProfile.api', () => ({
  getMyProfile: vi.fn(),
}));

describe('history API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('loads match history with the configured API URL', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    vi.resetModules();
    vi.mocked(getMyProfile).mockResolvedValue({ id: 'user-42' } as Awaited<ReturnType<typeof getMyProfile>>);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'm1',
            result: 'win',
          },
        ]),
    } as Response);

    const { getMyMatchHistory } = await import('../components/HistoryPage/history.api');

    await expect(getMyMatchHistory()).resolves.toEqual([
      {
        id: 'm1',
        result: 'win',
      },
    ]);
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/matches/history/user-42', {
      method: 'GET',
    });
  });

  it('throws when the history endpoint fails', async () => {
    vi.resetModules();
    vi.mocked(getMyProfile).mockResolvedValue({ id: 'user-7' } as Awaited<ReturnType<typeof getMyProfile>>);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    const { getMyMatchHistory } = await import('../components/HistoryPage/history.api');

    await expect(getMyMatchHistory()).rejects.toThrow('Could not load match history');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/matches/history/user-7', {
      method: 'GET',
    });
  });
});
