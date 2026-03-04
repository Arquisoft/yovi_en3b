import type { UserProfile, UserRanking } from "./userProfile.type";

/**
 * Mocked profile stored in-memory. Replace with real API calls later.
 */
let MOCK_PROFILE: UserProfile = {
  id: "user-001",
  username: "UO277488",
  displayName: "Player One",
  avatarId: "avatar_01",
};

let MOCK_RANKING: UserRanking = {
  position: 57,
  totalPlayers: 161,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getMyProfile(): Promise<UserProfile> {
  await sleep(250);

  // TODO: BACKEND - Replace the mock with a real API call:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, { credentials: "include" });
  // if (!res.ok) throw new Error("Failed to load profile");
  // return await res.json();

  return structuredClone(MOCK_PROFILE);
}

export async function updateMyProfile(patch: Partial<Pick<UserProfile, "displayName" | "avatarId">>): Promise<UserProfile> {
  await sleep(250);

  // TODO: BACKEND - Replace the mock with a real API call:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   credentials: "include",
  //   body: JSON.stringify(patch),
  // });
  // if (!res.ok) throw new Error("Failed to update profile");
  // return await res.json();

  MOCK_PROFILE = { ...MOCK_PROFILE, ...patch };
  return structuredClone(MOCK_PROFILE);
}

export async function getMyRanking(): Promise<UserRanking> {
  await sleep(200);

  // TODO: BACKEND - Replace with a ranking service call:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/ranking/me`, { credentials: "include" });
  // if (!res.ok) throw new Error("Failed to load ranking");
  // return await res.json();

  return structuredClone(MOCK_RANKING);
}
