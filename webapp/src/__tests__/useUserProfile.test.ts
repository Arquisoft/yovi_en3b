import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUserProfile } from '../components/UserProfile/useUserProfile';
import * as api from '../components/UserProfile/userProfile.api';

describe('useUserProfile Hook', () => {
  it('covers full lifecycle: loading, success, and saving', async () => {
    // 1. We mock the API calls to return a successful profile and ranking
    const { result } = renderHook(() => useUserProfile(true));

    // 2. Wait for the loading to finish and the profile to be set 
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.profile).not.toBeNull();
    expect(result.current.draftName).toBe("Player One");

    // 3. Modify the draft name to make it dirty
    act(() => {
      result.current.setDraftName("New Nickname");
    });
    expect(result.current.dirty).toBe(true);

    // 4. Execute the 'save' 
    await act(async () => {
      await result.current.save();
    });
    
    expect(result.current.saving).toBe(false);
    expect(result.current.profile?.displayName).toBe("New Nickname");

    // 5. Test the resetDraft function
    act(() => {
      result.current.setDraftName("Change Again");
      result.current.resetDraft();
    });
    expect(result.current.draftName).toBe("New Nickname");
  });

  it('covers error branches (catch blocks)', async () => {
  
    vi.spyOn(api, 'getMyProfile').mockRejectedValueOnce(new Error("Failed to load"));
    
    const { result } = renderHook(() => useUserProfile(true));

    await waitFor(() => expect(result.current.error).toBe("Failed to load"));
  });
});