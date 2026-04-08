# Ranking System Documentation

## Overview

The Game Y ranking system is a competitive leaderboard that tracks player performance across all matches. It automatically initializes rankings when players complete their first match and continuously updates statistics based on match results.

## Key Concepts

### Score Calculation

The player score is calculated using the following formula:

```
score = 50 * (2 * wins - total_matches)
```

Where:
- `wins` = Number of matches won by the player
- `total_matches` = Total number of matches played (wins + losses)

This formula rewards players for winning while penalizing losses, encouraging players to maintain high win rates.

### Win Rate

The win rate is calculated as:

```
win_rate = (wins / total_matches) * 100
```

This percentage is displayed in the global leaderboard to show player consistency.

### Ranking Position

Player positions are determined by sorting all players by their scores in descending order. Players with matching scores are ordered by most recent activity (`updated_at` timestamp).

## API Endpoints

### 1. Get My Ranking Position

**Endpoint:** `GET /ranking/me`

**Query Parameters:**
- `userId` (required, uuid): The UUID of the user

**Response:**
```json
{
  "position": 5,
  "totalPlayers": 127
}
```

**Status Codes:**
- `200 OK`: Ranking retrieved successfully
- `400 Bad Request`: userId parameter is missing
- `404 Not Found`: User not found in rankings (new players without completed matches)

### 2. Get Global Rankings

**Endpoint:** `GET /ranking/global`

**Response:**
```json
{
  "ranking": [
    {
      "position": 1,
      "user_id": "b2d7f9a1-7c3e-4b2a-9d8f-1a2b3c4d5e6f",
      "username": "champion_player",
      "nickname": "Champion",
      "photo": "avatar_01",
      "score": 450,
      "total_matches": 10,
      "win_matches": 9,
      "win_rate": 90,
      "last_game_won": true
    },
    {
      "position": 2,
      "user_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "username": "second_player",
      "nickname": "Runner-up",
      "photo": "avatar_02",
      "score": 400,
      "total_matches": 10,
      "win_matches": 8,
      "win_rate": 80,
      "last_game_won": false
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Rankings retrieved successfully
- `400 Bad Request`: Server error

### 3. Finish Match and Update Rankings

**Endpoint:** `POST /matches/finish`

**Request Body:**
```json
{
  "matchId": "550e8400-e29b-41d4-a716-446655440000",
  "winnerId": "b2d7f9a1-7c3e-4b2a-9d8f-1a2b3c4d5e6f"
}
```

**Response:**
```json
{
  "message": "Match finished successfully",
  "match": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "winner_id": "b2d7f9a1-7c3e-4b2a-9d8f-1a2b3c4d5e6f",
    "status": "finished",
    "ended_at": "2026-04-08T15:30:00Z"
  }
}
```

**What This Endpoint Does:**
1. Records the match completion with the winner
2. Sets the match status to "finished"
3. Identifies both the winner and loser
4. Initializes ranking entries for new players if needed
5. Updates both players' statistics:
   - Winner: increments total_matches and win_matches
   - Loser: increments total_matches only
6. Recalculates scores for both players

**Status Codes:**
- `200 OK`: Match finished and rankings updated successfully
- `400 Bad Request`: Missing or invalid matchId/winnerId parameters

## Data Flow

### When a Match is Completed

```
1. Game ends with a winner
   ↓
2. Frontend calls: POST /matches/finish
   {
     "matchId": "match-uuid",
     "winnerId": "winner-user-id"
   }
   ↓
3. Backend receives the request
4. Updates match record with winner and status
5. Retrieves both players' ranking records
   ↓
6. For new players (no ranking entry):
   └─ Create initial ranking with current match stats
   
   For existing players:
   └─ Update stats: total_matches += 1, win_matches += (1 if winner, 0 if loser)
7. Recalculate scores for both players
8. Persist changes to database
   ↓
9. Return success response
   ↓
10. User opens profile dialog
11. Frontend fetches: GET /ranking/me?userId=user-uuid
12. Backend queries rankings, finds user's position
13. Returns { position: X, totalPlayers: Y }
14. UI displays "Position X / Y"
```

## Database Schema

### Rankings Table

```sql
CREATE TABLE rankings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_matches INTEGER DEFAULT 0,
  win_matches INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Matches Table (Updated)

```sql
ALTER TABLE matches ADD COLUMN winner_id UUID;
ALTER TABLE matches ADD COLUMN ended_at TIMESTAMP;
ALTER TABLE matches ADD COLUMN status VARCHAR(20) DEFAULT 'in_progress';

-- Status values: 'in_progress', 'finished'
```

## Integration Guide

### For Frontend Developers

When integrating the ranking system into your game interface:

1. **After Match Ends:**
   ```javascript
   // Call this when a match completes
   const response = await fetch(`${API_URL}/matches/finish`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       matchId: matchIdFromGame,
       winnerId: winnerUserId
     })
   });
   ```

2. **To Display User Ranking in Profile:**
   ```javascript
   // This is already implemented in userProfile.api.ts
   // It automatically fetches and displays the user's ranking
   ```

3. **To Display Global Leaderboard:**
   ```javascript
   const rankings = await fetch(`${API_URL}/ranking/global`).then(r => r.json());
   // Display rankings.ranking array in a leaderboard view
   ```

## Important Notes

- **New Players**: Players without completed matches will not appear in rankings until they finish their first match
- **Score Updates**: Scores are recalculated immediately after each match completion
- **Real-time Leaderboard**: The global rankings endpoint returns live, up-to-date player standings
- **Graceful Degradation**: If the backend ranking API is unavailable, the frontend displays mock data to prevent UI breakage

## Testing

### Test Scenario: Player Completes First Match

1. Player A (new) completes match against Bot (Easy)
2. Player A wins
3. Frontend calls `POST /matches/finish` with Player A as winner
4. Backend creates ranking entry: `{position: 1, totalPlayers: 1}`
5. Player A opens profile: displays "1 / 1"

### Test Scenario: Multiple Players

1. Player A completes 10 matches, wins 9: score = 50 * (2*9 - 10) = 400
2. Player B completes 10 matches, wins 8: score = 50 * (2*8 - 10) = 300
3. Player C completes 5 matches, wins 5: score = 50 * (2*5 - 5) = 250
4. Global ranking: A (1st), B (2nd), C (3rd)

## Future Enhancements

- **Seasonal Rankings**: Reset rankings at the start of each season
- **Rating System**: Implement ELO-style rating adjustments based on opponent strength
- **Achievements**: Award badges for ranking milestones
- **Statistics**: Track additional metrics (average game time, most played opponents, etc.)
- **Real-time Updates**: WebSocket notifications for ranking changes
