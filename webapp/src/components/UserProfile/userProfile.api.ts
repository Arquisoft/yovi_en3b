import type { UserProfile, UserRanking } from "./userProfile.type";


let MOCK_RANKING: UserRanking = {
  position: 57,
  totalPlayers: 161,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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
    id: data._id || "no-id",
    username: data.username,
    displayName: data.nickname || data.username,
    avatarId: data.photo || "avatar_01"
  };
}

export async function updateMyProfile(patch: {displayName: string, avatarId: string}): Promise<UserProfile> {
  const username = localStorage.getItem('username');

  const res = await fetch(`${API_URL}/users/changeNickname`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      username: localStorage.getItem('username'),
      nickname: patch.displayName 
    }),
  });

  if (!res.ok) throw new Error("Error changing the nickname");

  const data = await res.json();
  return {
    id: data.id || data._id || "no-id",
    username: username || "user",
    displayName: data.nickname || patch.displayName,
    avatarId: data.photo || patch.avatarId
  };
}

export async function getMyRanking(): Promise<UserRanking> {
  await sleep(200);

  // TODO: BACKEND - Replace with a ranking service call:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/ranking/me`, { credentials: "include" });
  // if (!res.ok) throw new Error("Failed to load ranking");
  // return await res.json();

  return structuredClone(MOCK_RANKING);
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
