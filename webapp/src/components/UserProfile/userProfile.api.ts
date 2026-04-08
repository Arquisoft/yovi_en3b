import type { UserProfile, UserRanking } from "./userProfile.type";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Fallback mock data for when backend is unavailable or user not in rankings
const MOCK_RANKING: UserRanking = {
  position: 57,
  totalPlayers: 161,
};

export async function getMyProfile(): Promise<UserProfile> {
  const username = localStorage.getItem("username");
  const res = await fetch(`${API_URL}/users/findUserByUsername?username=${username}`, {
    method: "GET",
  });

  // If there was an error getting the user data
  if (!res.ok) {
    throw new Error("Could not load the profile");
  }

  // If the user data was retrieved
  const data = await res.json();
  return {
    id: data.id || data._id || "no-id",
    username: data.username,
    displayName: data.nickname || data.username,
    avatarId: data.avatarId || data.photo || "avatar_01"
  };
}


export async function updateMyProfile(patch: { displayName: string, avatarId: string }): Promise<UserProfile> {
  const username = localStorage.getItem('username');

  const res = await fetch(`${API_URL}/users/changeNickname`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: localStorage.getItem('username'),
      nickname: patch.displayName,
      photo: patch.avatarId
    }),
  });
  if (!res.ok) throw new Error("Error changing the nickname");

  const data = await res.json();
  return {
    id: data.id || data._id || "no-id",
    username: username || "user",
    displayName: data.nickname || patch.displayName,
    avatarId: data.avatarId || data.photo || patch.avatarId
  };
}


export async function getMyRanking(userId?: string): Promise<UserRanking> {
  try {
    if (!userId) {
      const profile = await getMyProfile();
      userId = profile.id;
    }

    console.log(`Fetching ranking for userId: ${userId}`);
    const res = await fetch(`${API_URL}/ranking/me?userId=${userId}`, { 
      method: "GET"
    });
    
    if (!res.ok) {
      console.warn(`Ranking API returned ${res.status}: ${res.statusText}`);
      return structuredClone(MOCK_RANKING);
    }

    const data = await res.json();
    console.log("Ranking data from API:", data);
    return data;
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return structuredClone(MOCK_RANKING);
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const username = localStorage.getItem('username');

  const res = await fetch(`${API_URL}/users/changePassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      username: username,
      currentPassword: currentPassword, 
      newPassword: newPassword 
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Error changing password. Check your current password.");
  }
} 
