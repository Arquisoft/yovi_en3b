# User Profile Feature

Complete implementation of the user profile panel (Issue #58), including profile data management, avatar selection, and ranking display.

## 📁 Architecture Overview

This feature follows a layered architecture:

```
AvatarPicker.tsx  ┐
useUserProfile.ts ├─→(components use the hook)
                  │
                  └─→ userProfile.api.ts (API layer)
                       │
                       └─→ userProfile.type.ts (Type definitions)
```

---

## 📋 File Guide

### 1. `userProfile.type.ts` – Type Definitions

Defines the core data structures:

```typescript
export type UserProfile = {
  id: string;
  username: string;          // read-only (unique identifier)
  displayName: string;       // editable (nickname)
  avatarId: string;          // editable (MVP: predefined avatars)
};

export type UserRanking = {
  position: number;          // read-only (from ranking service)
  totalPlayers?: number;     // optional
};
```

**Key Points:**
- `username` & `position` are **immutable** (from backend)
- `displayName` & `avatarId` are **editable** fields (can be updated)
- `avatarId` stores a reference ID for now (avoids file upload complexity MVP)

---

### 2. `userProfile.api.ts` – API Integration Layer

Handles all communication with backend services. Uses **mocks** for development.

#### Functions:

```typescript
export async function getMyProfile(): Promise<UserProfile>
```
Fetches the current user's profile. When backend is ready, uncomment the fetch call:
```typescript
// const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, { credentials: "include" });
```

---

```typescript
export async function updateMyProfile(
  patch: Partial<Pick<UserProfile, "displayName" | "avatarId">>
): Promise<UserProfile>
```
Updates only `displayName` and `avatarId`. Sends a PATCH request to the backend.

---

```typescript
export async function getMyRanking(): Promise<UserRanking>
```
Fetches ranking data (position in leaderboard). Future: connect to ranking service.

**Mock Data:**
```typescript
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
```

---

### 3. `useUserProfile.ts` – State Management Hook

React custom hook managing the profile panel's entire state and logic.

#### State:

```typescript
const [profile, setProfile] = useState<UserProfile | null>(null);
const [ranking, setRanking] = useState<UserRanking | null>(null);
const [loading, setLoading] = useState(false);      // Fetching data
const [saving, setSaving] = useState(false);        // Sending updates
const [error, setError] = useState<string | null>(null);

// Draft copies (temporary edits before save)
const [draftName, setDraftName] = useState("");
const [draftAvatarId, setDraftAvatarId] = useState("");
```

#### Change Detection:

```typescript
const dirty = useMemo(() => {
  if (!profile) return false;
  return draftName !== profile.displayName || draftAvatarId !== profile.avatarId;
}, [profile, draftName, draftAvatarId]);
```
Returns `true` if draft differs from saved profile. Use to disable "Save" button.

#### Data Fetching:

```typescript
useEffect(() => {
  if (!open) return;
  Promise.all([getMyProfile(), getMyRanking()])
    .then(([p, r]) => {
      setProfile(p);
      setRanking(r);
      setDraftName(p.displayName);     // Initialize draft
      setDraftAvatarId(p.avatarId);
    })
    .catch((e) => setError(...))
    .finally(() => setLoading(false));
}, [open]);
```
When panel opens, fetch profile + ranking and populate draft with loaded values.

#### Save Function:

```typescript
const save = useCallback(async () => {
  setSaving(true);
  const updated = await updateMyProfile({
    displayName: draftName.trim(),
    avatarId: draftAvatarId,
  });
  setProfile(updated);                    // Update saved copy
  setDraftName(updated.displayName);      // Keep draft in sync
  setDraftAvatarId(updated.avatarId);
  setSaving(false);
}, [profile, draftName, draftAvatarId]);
```
Sends changes to backend and updates saved profile if successful.

#### Reset Function:

```typescript
const resetDraft = useCallback(() => {
  if (!profile) return;
  setDraftName(profile.displayName);
  setDraftAvatarId(profile.avatarId);
}, [profile]);
```
Discards unsaved changes by reverting draft to last saved state.

#### Returned State:
```typescript
return {
  profile, ranking,           // Fetched data
  loading, saving, error,     // Status flags
  draftName, setDraftName,    // Editable name
  draftAvatarId, setDraftAvatarId, // Editable avatar
  dirty,                      // Has unsaved changes?
  save, resetDraft            // Actions
};
```

---

### 4. `AvatarPicker.tsx` – Avatar Selection Component

Presents predefined avatars for users to choose from.

#### Constants:

```typescript
const AVATARS = [
  { id: "avatar_01", label: "Avatar 1", emoji: "🧩" },
  { id: "avatar_02", label: "Avatar 2", emoji: "🎮" },
  { id: "avatar_03", label: "Avatar 3", emoji: "🚀" },
  { id: "avatar_04", label: "Avatar 4", emoji: "🏆" },
  { id: "avatar_05", label: "Avatar 5", emoji: "🦊" },
  { id: "avatar_06", label: "Avatar 6", emoji: "🐙" },
];
```

#### Utility Function:

```typescript
export function getAvatarBadge(avatarId: string) {
  return AVATARS.find(a => a.id === avatarId)?.emoji ?? "👤";
}
```
Converts an avatar ID to an emoji badge (useful for displaying selected avatar).

#### Component:

```typescript
export function AvatarPicker({ value, onChange }: Props) {
  // Renders a 6-column grid of emoji buttons
  // Selected button has blue border & light background
  // onClick triggers onChange callback with new avatarId
}
```

**Why predefined avatars (MVP)?**
- ✅ Avoids file upload complexity
- ✅ No server storage needed (just store ID)
- ✅ Fast to implement & test
- ✅ Works with current database schema

---

## 🚀 Future Roadmap: File Upload Migration

### Timeline: After MVP Complete

**Current State (MVP):**
```
avatarId: "avatar_01"  (references predefined set)
```

**Future State (v2):**
```
avatarUrl: "https://s3.example.com/avatars/user-001-custom.png"
         or "data:image/png;base64,..."  (base64 encoded)
```

### Migration Steps:

1. **Update Data Model:**
   ```typescript
   // userProfile.type.ts
   export type UserProfile = {
     id: string;
     username: string;
     displayName: string;
     avatarUrl: string;  // ← Changed from avatarId
   };
   ```

2. **Replace AvatarPicker:**
   ```typescript
   // Remove AVATARS constant
   // Replace emoji grid with file input: <input type="file" accept="image/*" />
   // Add image preview
   // Handle file upload (multipart/form-data to backend)
   ```

3. **Backend Changes:**
   - Add file upload endpoint: `POST /users/me/avatar`
   - Store files in S3/object storage or database blob
   - Return `avatarUrl` in user profile response
   - Update database schema: `avatarId` → `avatarUrl`

4. **API Integration:**
   ```typescript
   // userProfile.api.ts
   export async function uploadAvatar(file: File): Promise<string> {
     const formData = new FormData();
     formData.append("avatar", file);
     const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
       method: "POST",
       credentials: "include",
       body: formData,
     });
     if (!res.ok) throw new Error("Upload failed");
     const { avatarUrl } = await res.json();
     return avatarUrl;
   }
   ```

5. **UI Updates:**
   - Show file picker button
   - Display image preview during selection
   - Add loading spinner during upload
   - Handle upload errors gracefully

---

## 🧪 Integration Example

```typescript
import { useUserProfile } from "./useUserProfile";
import { AvatarPicker } from "./AvatarPicker";

export function ProfilePanel({ open, onClose }: Props) {
  const { profile, draftName, setDraftName, draftAvatarId, setDraftAvatarId, dirty, save, resetDraft, error } = useUserProfile(open);

  if (!profile) return null;

  return (
    <div>
      <h2>{profile.displayName}</h2>
      <p>Rank: {profile.ranking?.position}</p>
      
      <input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
      
      <AvatarPicker value={draftAvatarId} onChange={setDraftAvatarId} />
      
      <button onClick={save} disabled={!dirty}>Save</button>
      <button onClick={resetDraft} disabled={!dirty}>Cancel</button>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

---

## 📌 Summary

- **Type-safe** data structures for profile & ranking
- **Mock API** for development; easily swap for real backend
- **Custom hook** handles all state management & form logic
- **Draft pattern** ensures safe editing without losing original data
- **Predefined avatars** (MVP) avoid complexity; upgrade to file upload later
- **Clean separation of concerns** – types, API, logic, UI are decoupled

---

## ⚙️ Run & Dependencies

### Prerequisites

- Node.js (LTS). Node 18+ is recommended.
- npm (bundled with Node) or Yarn.

### Install project dependencies

Linux / macOS (bash, zsh):

```bash
# from the webapp folder
npm install
# ensure router types (TypeScript projects)
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

Windows PowerShell:

```powershell
# from the webapp folder
npm install
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

Windows CMD:

```cmd
cd webapp
npm install
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

### Common scripts

- Start dev server: `npm run dev`
- Build: `npm run build`
- Run unit tests: `npm run test`
- Run E2E: `npm run test:e2e` (see top-level `package.json` for combined start)

If you prefer Yarn, replace `npm install` with `yarn` and `npm run <script>` with `yarn <script>`.

---

## 🔁 What changed (why we added a router)

Two small edits were made so the `ProfileOverlay` hook (`useNavigate`) works and the avatar button opens the panel:

- `main.tsx`: the app root is now wrapped with a React Router provider so hooks like `useNavigate` work anywhere in the tree. The change is:
  - Before: the root rendered `<App />` directly.
  - After: the root renders `<BrowserRouter><App /></BrowserRouter>` so the whole component tree is connected to routing.

- `App.tsx`: converted the root to a declarative route map using React Router's `<Routes>` / `<Route>` so the app now serves at least two routes: `/` (the main hub) and `/history` (the history page used by the profile overlay).

- `MainMenu` (the Main Hub): a `useState` hook `profileOpen` was added and the profile icon button was wired to `setProfileOpen(true)`. The component now also renders `<ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />` so the avatar button shows the overlay.

These changes let `ProfileOverlay` use `useNavigate('/history')` and let users open/close the profile panel from the main hub.

---

## 📂 `src` package structure (overview)

This project organises UI and logic into a few main folders (high-level overview):

- `src/components` — small, app-level presentational components used by multiple pages (e.g. `MainMenu`, header widgets).
- `src/features` — feature-scoped implementations grouped by domain. For example:
  - `src/features/profile` — the user profile feature (this folder). Contains `ProfileOverlay.tsx`, `AvatarPicker.tsx`, `useUserProfile.ts`, `userProfile.api.ts`, and type files.
  - other features follow the same pattern (hook + API + components).
- `src/pages` — page-level components that are routed to (e.g. `HistoryPage.tsx`).
- `src/assets` or `public` — static assets, fonts and images.
- `src/App.tsx` — application route map and top-level wiring.
- `src/main.tsx` — application entrypoint that mounts React and (now) the `BrowserRouter` provider.

This structure keeps API/data logic (`userProfile.api.ts`), UI (`AvatarPicker.tsx`, `ProfileOverlay.tsx`) and types (`userProfile.type.ts`) separated and easy to maintain.

If you want, I can also:

- add a small note to the root `webapp/package.json` listing `react-router-dom` as an explicit dependency (I installed it locally already),
- or open a PR adding the new `HistoryPage` file into `/src/pages` (I already added a small placeholder to make routes compile).
