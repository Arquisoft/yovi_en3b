import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMyProfile, updateMyProfile, getMyRanking, changePassword } from '../components/UserProfile/userProfile.api';

describe('userProfile API service', () => {
    // Base URL from the original class logic
    const API_URL = "http://localhost:3000";

    beforeEach(() => {
        // Clear all mocks and localStorage before each test
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
        localStorage.clear();
        
        // Mock import.meta.env.VITE_API_URL if necessary
        vi.stubGlobal('import.meta', {
            env: { VITE_API_URL: API_URL }
        });
    });

    describe('getMyProfile', () => {
        it('should fetch user profile using the username from localStorage', async () => {
            const mockUsername = 'testuser';
            localStorage.setItem('username', mockUsername);

            const mockResponse = {
                _id: '123',
                username: mockUsername,
                nickname: 'TestPlayer',
                photo: 'avatar_05'
            };

            // Setup successful fetch mock
            (fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await getMyProfile();

            // Verify mapping from backend fields (nickname, photo) to frontend fields (displayName, avatarId)
            expect(result).toEqual({
                id: '123',
                username: mockUsername,
                displayName: 'TestPlayer',
                avatarId: 'avatar_05'
            });

            // Verify the constructed URL with query parameters
            expect(fetch).toHaveBeenCalledWith(
                `${API_URL}/users/findUserByUsername?username=${mockUsername}`,
                { method: 'GET' }
            );
        });

        it('should throw an error if the profile response is not ok', async () => {
            (fetch as any).mockResolvedValue({ ok: false });
            await expect(getMyProfile()).rejects.toThrow("Could not load the profile");
        });
    });

    describe('updateMyProfile', () => {
        it('should send a POST request to change the nickname', async () => {
            const mockUsername = 'testuser';
            localStorage.setItem('username', mockUsername);
            const patch = { displayName: 'NewNickname', avatarId: 'avatar_02' };

            const mockResponse = {
                _id: '123',
                nickname: 'NewNickname',
                photo: 'avatar_02'
            };

            (fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await updateMyProfile(patch);

            // Verify the payload matches the backend requirements (username and nickname)
            expect(fetch).toHaveBeenCalledWith(
                `${API_URL}/users/changeNickname`,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: mockUsername,
                        nickname: patch.displayName
                    })
                })
            );

            expect(result.displayName).toBe('NewNickname');
        });

        it('should throw an error if the update fails', async () => {
            (fetch as any).mockResolvedValue({ ok: false });
            await expect(updateMyProfile({ displayName: '', avatarId: '' }))
                .rejects.toThrow("Error changing the nickname");
        });
    });

    describe('getMyRanking', () => {
        it('should return the mock ranking data after a short delay', async () => {
            // Testing the current hardcoded implementation in the original class
            const result = await getMyRanking();
            
            expect(result).toHaveProperty('position');
            expect(result).toHaveProperty('totalPlayers');
            expect(typeof result.position).toBe('number');
        });
    });

    describe('changePassword', () => {
        it('should send the current and new password to the backend', async () => {
            const mockUsername = 'testuser';
            localStorage.setItem('username', mockUsername);

            (fetch as any).mockResolvedValue({ ok: true });

            await changePassword('oldPass', 'newPass');

            expect(fetch).toHaveBeenCalledWith(
                `${API_URL}/users/changePassword`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        username: mockUsername,
                        currentPassword: 'oldPass',
                        newPassword: 'newPass'
                    })
                })
            );
        });

        it('should throw a specific error message if provided by the backend', async () => {
            const backendError = "Password too weak";
            (fetch as any).mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ error: backendError })
            });

            await expect(changePassword('a', 'b')).rejects.toThrow(backendError);
        });

        it('should throw a default error message if the backend error is unknown', async () => {
            (fetch as any).mockResolvedValue({
                ok: false,
                json: () => Promise.reject() // Simulate invalid JSON response
            });

            await expect(changePassword('a', 'b'))
                .rejects.toThrow("Error changing password. Check your current password.");
        });
    });
});