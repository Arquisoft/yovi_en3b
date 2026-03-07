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