export type UserProfile = {
  id: string;
  username: string;          // read-only
  displayName: string;       // editable
  avatarId: string;          // editable (MVP)
};

export type UserRanking = {
  position: number;          // read-only, from ranking service
  totalPlayers?: number;     // optional
};
