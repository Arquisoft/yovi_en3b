import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserProfile } from '../components/UserProfile/useUserProfile';
import * as api from '../components/UserProfile/userProfile.api';

// Mocks of the API functions
vi.mock('../components/UserProfile/userProfile.api', () => ({
  getMyProfile: vi.fn(),
  getMyRanking: vi.fn(),
  updateMyProfile: vi.fn(),
}));

describe('useUserProfile Hook', () => {
  const mockProfile = {
    id: 'u1',
    username: 'testuser',
    displayName: 'Player One',
    avatarId: 'avatar_01',
  };

  const mockRanking = { position: 1, totalPlayers: 10 };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful implementation
    vi.mocked(api.getMyProfile).mockResolvedValue(mockProfile);
    vi.mocked(api.getMyRanking).mockResolvedValue(mockRanking);
  });

  it('covers full lifecycle: loading, success, and saving', async () => {
    // 1. Render hook with open=true to trigger useEffect
    const { result } = renderHook(() => useUserProfile(true));

    // Initially should be loading
    expect(result.current.loading).toBe(true);

    // 2. Wait for loading to finish
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.ranking).toEqual(mockRanking);
    expect(result.current.draftName).toBe("Player One");
    expect(result.current.dirty).toBe(false);

    // 3. Modify draft to make it dirty
    act(() => {
      result.current.setDraftName("New Nickname");
      result.current.setDraftAvatarId("avatar_02");
    });
    expect(result.current.dirty).toBe(true);

    // 4. Mock successful save
    const updatedProfile = { ...mockProfile, displayName: "New Nickname", avatarId: "avatar_02" };
    vi.mocked(api.updateMyProfile).mockResolvedValue(updatedProfile);

    await act(async () => {
      await result.current.save();
    });
    
    expect(result.current.saving).toBe(false);
    expect(result.current.profile?.displayName).toBe("New Nickname");
    expect(result.current.dirty).toBe(false);

    // 5. Test resetDraft function
    act(() => {
      result.current.setDraftName("Temp Name");
    });
    expect(result.current.dirty).toBe(true);
    
    act(() => {
      result.current.resetDraft();
    });
    expect(result.current.draftName).toBe("New Nickname");
    expect(result.current.dirty).toBe(false);
  });

  it('should not fetch data if open is false', () => {
    renderHook(() => useUserProfile(false));
    expect(api.getMyProfile).not.toHaveBeenCalled();
  });

  it('covers error branches when loading fails', async () => {
    vi.mocked(api.getMyProfile).mockRejectedValueOnce(new Error("Failed to load"));
    
    const { result } = renderHook(() => useUserProfile(true));

    await waitFor(() => expect(result.current.error).toBe("Failed to load"));
    expect(result.current.loading).toBe(false);
  });

  it('sets unknown error when save fails with non-Error object', async () => {
    // Initial load success
    const { result } = renderHook(() => useUserProfile(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Mock save rejection with a string instead of Error object
    vi.mocked(api.updateMyProfile).mockRejectedValueOnce("Server Boom");

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.error).toBe('Unknown error');
    expect(result.current.saving).toBe(false);
  });

  it('returns early in save if profile is null', async () => {
    const { result } = renderHook(() => useUserProfile(false)); // profile will be null
    
    await act(async () => {
      await result.current.save();
    });

    expect(api.updateMyProfile).not.toHaveBeenCalled();
    expect(result.current.saving).toBe(false);
  });
});