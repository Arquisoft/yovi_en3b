# Developer Guide: Ranking System

## Quick Start for Developers

### For Game Frontend Developers

When a match completes, you need to notify the backend so it can update rankings:

```javascript
// In your game completion handler
const completeMatch = async (gameState, winnerId) => {
  try {
    // 1. Get the current match ID from the game state
    const matchId = gameState.matchId;
    
    // 2. Identify the winner
    const winnerId = gameState.winnerId; // UUID of winning player
    
    // 3. Call the finish endpoint
    const response = await fetch('http://localhost:3000/matches/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        winnerId
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Match recorded:', data);
      // Optionally navigate to profile or show ranking update
    } else {
      console.error('Failed to record match');
    }
  } catch (error) {
    console.error('Error finishing match:', error);
  }
};
```

### For Profile/UI Developers

The ranking display is already implemented in the `useUserProfile` hook. It automatically:

1. Fetches the user's profile
2. Fetches their current ranking position
3. Displays it in the profile dialog

The ranking is shown as: **Position X / Total Players**

Example display:
```
RANKING
5 / 127
```

### For Backend Developers

The ranking system consists of these main components:

#### 1. Match Completion Handler

**File:** `users/src/modules/match/domain/matchService.js`

```javascript
const finishMatch = async (matchId, winnerId) => {
  // 1. Record the match result
  const match = await matchRepository.finishMatch(matchId, winnerId);
  
  // 2. Update both players' rankings
  const bluePlayerId = match.blue_player_id;
  const redPlayerId = match.red_player_id;
  
  const isBlueWinner = winnerId === bluePlayerId;
  const loser = isBlueWinner ? redPlayerId : bluePlayerId;
  
  // Update winner: +1 match, +1 win
  await rankingService.updateOrInitializeRanking(winnerId, 1, 1);
  
  // Update loser: +1 match, 0 wins
  if (loser) {
    await rankingService.updateOrInitializeRanking(loser, 1, 0);
  }
  
  return match;
};
```

#### 2. Ranking Service

**File:** `users/src/modules/ranking/domain/rankingService.js`

Key functions:

```javascript
// Get user's position in global rankings
const getUserRankingPosition = async (userId) => {
  const allRankings = await rankingRepo.getAllRankings();
  const totalPlayers = allRankings.length;
  const position = allRankings.findIndex(r => r.user_id === userId) + 1;
  
  return { position, totalPlayers };
};

// Initialize or update player rankings
const updateOrInitializeRanking = async (userId, totalMatches, winMatches) => {
  const existing = await rankingRepo.getRankingByUser(userId);
  
  if (existing) {
    // Update existing
    const newTotal = existing.total_matches + totalMatches;
    const newWins = existing.win_matches + winMatches;
    return rankingRepo.updateRanking(userId, { 
      totalMatches: newTotal, 
      winMatches: newWins 
    });
  } else {
    // Initialize new
    return rankingRepo.addToRanking(userId, { 
      totalMatches, 
      winMatches 
    });
  }
};

// Get global leaderboard
const getGlobalRanking = async () => {
  return rankingRepo.getGlobalRankings();
};
```

#### 3. Database Queries

**File:** `users/src/modules/ranking/data-access/rankingQueries.js`

The queries retrieve rankings with proper ordering:

```javascript
// Get all rankings sorted by score
getAllRankings: `
  SELECT user_id, score, total_matches, win_matches, updated_at
  FROM rankings
  ORDER BY score DESC, updated_at DESC
`

// Get global rankings with player details
getGlobalRankings: `
  SELECT
    r.user_id,
    u.username,
    u.nickname,
    u.photo,
    r.score,
    r.total_matches,
    r.win_matches,
    COALESCE(ROUND((r.win_matches::numeric * 100) / NULLIF(r.total_matches, 0)), 0)::int AS win_rate,
    COALESCE(last_match.winner_id = r.user_id, false) AS last_game_won,
    ROW_NUMBER() OVER (ORDER BY r.score DESC, r.updated_at DESC) AS position
  FROM rankings r
  INNER JOIN users u ON u.id = r.user_id
  LEFT JOIN LATERAL (
    SELECT winner_id
    FROM matches m
    WHERE (m.blue_player_id = r.user_id OR m.red_player_id = r.user_id)
      AND m.status = 'finished'
    ORDER BY COALESCE(m.ended_at, m.created_at) DESC
    LIMIT 1
  ) last_match ON true
  ORDER BY r.score DESC, r.updated_at DESC
`
```

## Database Schema

### Migrations Performed

```sql
-- 1. Add rankings table
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_matches INTEGER DEFAULT 0,
  win_matches INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Add indexes for performance
CREATE INDEX idx_rankings_score ON rankings(score DESC);
CREATE INDEX idx_rankings_user_id ON rankings(user_id);

-- 3. Update matches table
ALTER TABLE matches ADD COLUMN winner_id UUID;
ALTER TABLE matches ADD COLUMN ended_at TIMESTAMP;
ALTER TABLE matches ADD COLUMN status VARCHAR(20) DEFAULT 'in_progress';
ALTER TABLE matches ADD FOREIGN KEY (winner_id) REFERENCES users(id);

-- 4. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_rankings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rankings_updated_at
BEFORE UPDATE ON rankings
FOR EACH ROW
EXECUTE FUNCTION update_rankings_timestamp();
```

## Testing the Ranking System

### Manual Testing Steps

1. **Create two test users:**
   ```bash
   curl -X POST http://localhost:3000/createuser \
     -H "Content-Type: application/json" \
     -d '{
       "username": "player1",
       "email": "p1@test.com",
       "password": "Test123!@",
       "nickname": "Player One",
       "photo": "avatar_01"
     }'
   
   curl -X POST http://localhost:3000/createuser \
     -H "Content-Type: application/json" \
     -d '{
       "username": "player2",
       "email": "p2@test.com",
       "password": "Test123!@",
       "nickname": "Player Two",
       "photo": "avatar_02"
     }'
   ```

2. **Create a match:**
   ```bash
   curl -X POST http://localhost:3000/matches/create \
     -H "Content-Type: application/json" \
     -d '{
       "bluePlayerId": "player1-uuid",
       "redPlayerId": "player2-uuid",
       "isBot": false,
       "botDifficulty": 0
     }'
   ```

3. **Finish the match (player1 wins):**
   ```bash
   curl -X POST http://localhost:3000/matches/finish \
     -H "Content-Type: application/json" \
     -d '{
       "matchId": "match-uuid",
       "winnerId": "player1-uuid"
     }'
   ```

4. **Check player1's ranking:**
   ```bash
   curl http://localhost:3000/ranking/me?userId=player1-uuid
   # Expected: { "position": 1, "totalPlayers": 1 }
   ```

5. **Check global rankings:**
   ```bash
   curl http://localhost:3000/ranking/global
   # Should show both players with player1 ranked higher
   ```

### Automated Testing

Example test using Jest/Vitest:

```javascript
describe('Ranking System', () => {
  it('should initialize ranking on first match', async () => {
    const matchId = 'test-match-1';
    const winnerId = 'test-user-1';
    
    await matchService.finishMatch(matchId, winnerId);
    
    const ranking = await rankingService.getUserRankingPosition(winnerId);
    expect(ranking.position).toBe(1);
    expect(ranking.totalPlayers).toBe(1);
  });
  
  it('should calculate correct score', async () => {
    // Player with 10 wins, 0 losses
    const score = 50 * (2 * 10 - 10);
    expect(score).toBe(500);
  });
  
  it('should update rankings for both players', async () => {
    const player1 = 'user-1';
    const player2 = 'user-2';
    
    // Complete 5 matches, player1 wins all
    for (let i = 0; i < 5; i++) {
      await matchService.finishMatch(`match-${i}`, player1);
    }
    
    const p1Ranking = await rankingService.getUserRankingPosition(player1);
    const p2Ranking = await rankingService.getUserRankingPosition(player2);
    
    expect(p1Ranking.position).toBe(1);
    expect(p2Ranking.position).toBe(2);
  });
});
```

## Common Issues & Solutions

### Issue: "User not found in rankings"

**Cause:** Player hasn't completed any matches yet.

**Solution:** Have the player complete a match first. The ranking entry is created automatically.

### Issue: Ranking shows as "57 / 161" (mock data)

**Cause:** The API endpoint is returning an error or the backend service is down.

**Solution:** 
1. Check if the users service is running: `docker-compose ps`
2. Check the browser console for error messages
3. Verify the `VITE_API_URL` environment variable is correctly set
4. Check backend logs: `docker-compose logs users`

### Issue: Rankings not updating after match

**Cause:** The `/matches/finish` endpoint wasn't called.

**Solution:** Verify the game completion handler is calling:
```javascript
POST /matches/finish with { matchId, winnerId }
```

## Performance Optimization

### Query Optimization

1. **Add database indexes:**
   ```sql
   CREATE INDEX idx_rankings_score ON rankings(score DESC);
   CREATE INDEX idx_rankings_user_id ON rankings(user_id);
   CREATE INDEX idx_matches_status ON matches(status);
   ```

2. **Cache global rankings:**
   - Currently fetched on every request
   - Consider caching for 5-10 minutes in production
   - Invalidate cache when new match completes

3. **Pagination for global rankings:**
   - Implement `LIMIT` and `OFFSET` for large player bases
   - Currently returns all players (O(n) complexity)

### Frontend Optimization

1. **Memoize ranking data:**
   ```typescript
   const cachedRanking = useMemo(() => ranking, [ranking.position, ranking.totalPlayers]);
   ```

2. **Lazy load global leaderboard:**
   - Don't fetch until user navigates to ranking page
   - Use skeleton loaders while fetching

## Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ProfileOverlay Component                        │  │
│  │  - Displays: Position X / Y                      │  │
│  │  - Fetches: GET /ranking/me?userId=...          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GameScreen Component                            │  │
│  │  - On match end: POST /matches/finish            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
         │
         │ HTTP API
         ▼
┌────────────────────────────────────────────────────────┐
│            Backend (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes                                          │  │
│  │  - POST /matches/finish                          │  │
│  │  - GET /ranking/me                               │  │
│  │  - GET /ranking/global                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Match Service / Ranking Service                 │  │
│  │  - finishMatch(matchId, winnerId)                │  │
│  │  - updateOrInitializeRanking(userId, stats)      │  │
│  │  - getUserRankingPosition(userId)                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Data Access Layer                               │  │
│  │  - matchRepository                               │  │
│  │  - rankingRepository                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
         │
         │ SQL Queries
         ▼
┌────────────────────────────────────────────────────────┐
│         PostgreSQL Database                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tables:                                          │  │
│  │ - users                                          │  │
│  │ - matches                                        │  │
│  │ - rankings                                       │  │
│  │ - game_saves                                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Additional Resources

- **API Documentation:** See `users/openapi.yaml`
- **Architecture Documentation:** See `docs/src/08_concepts.adoc`
- **Project README:** See root `README.md`
