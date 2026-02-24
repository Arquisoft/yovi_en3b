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

    it('Crea una partida contra un bot correctamente', async () => {
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

    it('Falla si no le pasas la dificultad del bot', async () => {
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
});