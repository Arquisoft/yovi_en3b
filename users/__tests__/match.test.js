import { describe, it, expect, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
import app from '../index.js';
const db = require('../src/db/db.js');

describe('POST /matches/create', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Creates a match against a bot successfully', async () => {
        const fakeUserId = '123e4567-e89b-12d3-a456-426614174000';
        
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{ 
                id: '999e4567-e89b-12d3-a456-426614174999', 
                blue_player_id: fakeUserId, 
                is_bot: true, 
                bot_difficulty: 2,
                status: 'in_progress'
            }]
        });

        const res = await request(app)
            .post('/matches/create')
            .send({ 
                bluePlayerId: fakeUserId,
                isBot: true,
                botDifficulty: 2
            })
            .set('Accept', 'application/json');

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/Match created succesfully/i);
        expect(res.body.match.is_bot).toBe(true);
    });

    it('Fails if bot difficulty is not provided', async () => {
        const fakeUserId = '123e4567-e89b-12d3-a456-426614174000';

        const res = await request(app)
            .post('/matches/create')
            .send({ 
                bluePlayerId: fakeUserId,
                isBot: true
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/If you play against a BOT, you must select a difficulty./i);
    });

    it('Creates a match with two real players', async () => {
        const fakeBlueUserId = '123e4567-e89b-12d3-a456-426614174000';
        const fakeRedUserId = '223e4567-e89b-12d3-a456-426614174001';

        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{ 
                id: '333e4567-e89b-12d3-a456-426614174333', 
                blue_player_id: fakeBlueUserId,
                red_player_id: fakeRedUserId,
                is_bot: false, 
                bot_difficulty: 0,
                status: 'in_progress'
            }]
        });

        const res = await request(app)
            .post('/matches/create')
            .send({ 
                bluePlayerId: fakeBlueUserId,
                redPlayerId: fakeRedUserId,
                isBot: false
            })
            .set('Accept', 'application/json');

        expect(res.status).toBe(201);
        expect(res.body.match.is_bot).toBe(false);
    });
});

describe('GET /matches/user/:playerId', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Returns a list of matches for a given player ID', async () => {
        const fakeUserId = '123e4567-e89b-12d3-a456-426614174000';
        
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [
                { id: 'match_1', blue_player_id: fakeUserId, is_bot: true, status: 'in_progress' },
                { id: 'match_2', red_player_id: fakeUserId, is_bot: false, status: 'finished' }
            ]
        });

        const res = await request(app).get(`/matches/user/${fakeUserId}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0].id).toBe('match_1');
    });

    it('Returns an empty array if the player has no matches', async () => {
        const fakeUserId = 'user-with-no-matches';
        
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: []
        });

        const res = await request(app).get(`/matches/user/${fakeUserId}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
});

describe('POST /matches/finish', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Finishes a match and updates rankings for winner', async () => {
        const matchId = '123e4567-e89b-12d3-a456-426614174000';
        const winnerId = 'player-blue-id';
        const loserId = 'player-red-id';

        // Mock the match update query
        vi.spyOn(db, 'query').mockResolvedValueOnce({
            rows: [{
                id: matchId,
                blue_player_id: winnerId,
                red_player_id: loserId,
                is_bot: false,
                status: 'finished',
                winner_id: winnerId,
                ended_at: '2024-01-15T10:30:00Z'
            }]
        }).mockResolvedValueOnce({
            rows: [{ user_id: winnerId, total_matches: 1, win_matches: 1 }]
        }).mockResolvedValueOnce({
            rows: [{ user_id: loserId, total_matches: 1, win_matches: 0 }]
        });

        const res = await request(app)
            .post('/matches/finish')
            .send({ matchId, winnerId })
            .set('Accept', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Match finished/i);
        expect(res.body.match.winner_id).toBe(winnerId);
        expect(res.body.match.status).toBe('finished');
    });

    it('Returns 400 if matchId is missing', async () => {
        const res = await request(app)
            .post('/matches/finish')
            .send({ winnerId: 'player-id' })
            .set('Accept', 'application/json');

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/matchId|required/i);
    });

    it('Returns 400 if winnerId is missing', async () => {
        const res = await request(app)
            .post('/matches/finish')
            .send({ matchId: 'match-id' })
            .set('Accept', 'application/json');

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/winnerId|required/i);
    });

    it('Returns 404 if match not found', async () => {
        const matchId = 'non-existent-match';
        const winnerId = 'player-id';

        vi.spyOn(db, 'query').mockResolvedValue({
            rows: []
        });

        const res = await request(app)
            .post('/matches/finish')
            .send({ matchId, winnerId })
            .set('Accept', 'application/json');

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/Match not found|not found/i);
    });

    it('Returns 400 if winnerId is not a player in the match', async () => {
        const matchId = 'match-id';
        const winnerId = 'unknown-player';
        const bluePlayerId = 'player-blue';
        const redPlayerId = 'player-red';

        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{
                id: matchId,
                blue_player_id: bluePlayerId,
                red_player_id: redPlayerId,
                is_bot: false
            }]
        });

        const res = await request(app)
            .post('/matches/finish')
            .send({ matchId, winnerId })
            .set('Accept', 'application/json');

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/winner|not.*match|invalid/i);
    });

    it('Updates both player rankings when match finishes', async () => {
        const matchId = 'test-match';
        const winnerId = 'winner-user';
        const loserId = 'loser-user';

        // Mock successful query sequence:
        // 1. Get/update match
        // 2. Update winner ranking
        // 3. Update loser ranking
        vi.spyOn(db, 'query')
            .mockResolvedValueOnce({
                rows: [{
                    id: matchId,
                    blue_player_id: winnerId,
                    red_player_id: loserId,
                    winner_id: winnerId
                }]
            })
            .mockResolvedValueOnce({
                rows: [{ user_id: winnerId, total_matches: 5, win_matches: 4 }]
            })
            .mockResolvedValueOnce({
                rows: [{ user_id: loserId, total_matches: 5, win_matches: 2 }]
            });

        const res = await request(app)
            .post('/matches/finish')
            .send({ matchId, winnerId })
            .set('Accept', 'application/json');

        expect(res.status).toBe(200);
        // Verify both players had ranking updates called
        expect(db.query).toHaveBeenCalledTimes(3); // match update + 2 ranking updates
    });

    it('Handles bot matches correctly', async () => {
        const matchId = 'bot-match';
        const winnerId = 'human-player';
        const botId = 'bot-player';

        vi.spyOn(db, 'query')
            .mockResolvedValueOnce({
                rows: [{
                    id: matchId,
                    blue_player_id: winnerId,
                    red_player_id: botId,
                    is_bot: true,
                    bot_difficulty: 2,
                    winner_id: winnerId
                }]
            })
            .mockResolvedValueOnce({
                rows: [{ user_id: winnerId, total_matches: 1, win_matches: 1 }]
            });

        const res = await request(app)
            .post('/matches/finish')
            .send({ matchId, winnerId })
            .set('Accept', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body.match.is_bot).toBe(true);
    });
});
