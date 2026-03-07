import { describe, it, expect, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
import app from '../index.js';
const db = require('../src/db/db.js');

describe('GameSave API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('POST /gamesaves/save', () => {
        it('Saves a move successfully', async () => {
            const fakeMatchId = '111e4567-e89b-12d3-a456-426614174111';
            const fakePlayerId = '123e4567-e89b-12d3-a456-426614174000';
            const boardState = JSON.stringify({
                size: 5,
                turn: 1,
                players: ['B', 'R'],
                layout: 'B/BR/.R./..../...../'
            });

            vi.spyOn(db, 'query').mockResolvedValue({
                rows: [{
                    id: '999e4567-e89b-12d3-a456-426614174999',
                    match_id: fakeMatchId,
                    move_number: 1,
                    player_id: fakePlayerId,
                    move_coordinates: 'C3',
                    resulting_board_state: boardState,
                    created_at: new Date().toISOString()
                }]
            });

            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: fakeMatchId,
                    moveNumber: 1,
                    playerId: fakePlayerId,
                    moveCoordinates: 'C3',
                    resultingBoardState: boardState
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(201);
            expect(res.body.message).toMatch(/Game save created successfully/i);
            expect(res.body.gameSave.move_coordinates).toBe('C3');
            expect(res.body.gameSave.move_number).toBe(1);
        });

        it('Fails if matchId is missing', async () => {
            const boardState = JSON.stringify({ board: [] });

            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    moveNumber: 1,
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                    moveCoordinates: 'C3',
                    resultingBoardState: boardState
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Match ID is required/i);
        });

        it('Fails if moveNumber is missing', async () => {
            const boardState = JSON.stringify({ size: 5, turn: 0, players: ['B', 'R'], layout: 'B/.../.../.../...../' });

            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: '111e4567-e89b-12d3-a456-426614174111',
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                    moveCoordinates: 'C3',
                    resultingBoardState: boardState
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Move number is required/i);
        });

        it('Fails if moveNumber is not a positive integer', async () => {
            const boardState = JSON.stringify({ size: 5, turn: 0, players: ['B', 'R'], layout: 'B/.../.../.../...../' });

            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: '111e4567-e89b-12d3-a456-426614174111',
                    moveNumber: -1,
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                    moveCoordinates: 'C3',
                    resultingBoardState: boardState
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Move number must be a positive integer/i);
        });

        it('Fails if playerId is missing', async () => {
            const boardState = JSON.stringify({ size: 5, turn: 0, players: ['B', 'R'], layout: 'B/.../.../.../...../' });

            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: '111e4567-e89b-12d3-a456-426614174111',
                    moveNumber: 1,
                    moveCoordinates: 'C3',
                    resultingBoardState: boardState
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Player ID is required/i);
        });

        it('Fails if moveCoordinates is missing', async () => {
            const boardState = JSON.stringify({ size: 5, turn: 0, players: ['B', 'R'], layout: 'B/.../.../.../...../' });

            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: '111e4567-e89b-12d3-a456-426614174111',
                    moveNumber: 1,
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                    resultingBoardState: boardState
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Move coordinates must be a non-empty string/i);
        });

        it('Fails if resultingBoardState is missing', async () => {
            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: '111e4567-e89b-12d3-a456-426614174111',
                    moveNumber: 1,
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                    moveCoordinates: 'C3'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Board state must be a non-empty JSON string/i);
        });

        it('Fails if resultingBoardState is not valid JSON', async () => {
            const res = await request(app)
                .post('/gamesaves/save')
                .send({
                    matchId: '111e4567-e89b-12d3-a456-426614174111',
                    moveNumber: 1,
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                    moveCoordinates: 'C3',
                    resultingBoardState: 'invalid json'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Board state must be valid JSON/i);
        });
    });

    describe('GET /gamesaves/:matchId', () => {
        it('Retrieves all moves for a match', async () => {
            const fakeMatchId = '111e4567-e89b-12d3-a456-426614174111';
            const boardState1 = JSON.stringify({ size: 5, turn: 0, players: ['B', 'R'], layout: 'B/../../.../..../' });
            const boardState2 = JSON.stringify({ size: 5, turn: 1, players: ['B', 'R'], layout: 'B/BR/..../..../...../' });

            vi.spyOn(db, 'query').mockResolvedValue({
                rows: [
                    {
                        id: '999e4567-e89b-12d3-a456-426614174999',
                        match_id: fakeMatchId,
                        move_number: 1,
                        player_id: '123e4567-e89b-12d3-a456-426614174000',
                        move_coordinates: 'C3',
                        resulting_board_state: boardState1,
                        created_at: new Date().toISOString()
                    },
                    {
                        id: '888e4567-e89b-12d3-a456-426614174888',
                        match_id: fakeMatchId,
                        move_number: 2,
                        player_id: '223e4567-e89b-12d3-a456-426614174001',
                        move_coordinates: 'D4',
                        resulting_board_state: boardState2,
                        created_at: new Date().toISOString()
                    }
                ]
            });

            const res = await request(app)
                .get(`/gamesaves/${fakeMatchId}`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/Moves retrieved successfully/i);
            expect(res.body.moves).toHaveLength(2);
            expect(res.body.moves[0].move_number).toBe(1);
            expect(res.body.moves[1].move_number).toBe(2);
        });

        it('Fails if matchId is invalid', async () => {
            vi.spyOn(db, 'query').mockRejectedValue(new Error('Invalid matchId'));

            const res = await request(app)
                .get('/gamesaves/invalid-id')
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
        });
    });

    describe('GET /gamesaves/:matchId/moves/:moveNumber', () => {
        it('Retrieves a specific move', async () => {
            const fakeMatchId = '111e4567-e89b-12d3-a456-426614174111';
            const boardState = JSON.stringify({ board: [] });

            vi.spyOn(db, 'query').mockResolvedValue({
                rows: [{
                    id: '999e4567-e89b-12d3-a456-426614174999',
                    match_id: fakeMatchId,
                    move_number: 1,
                    player_id: '123e4567-e89b-12d3-a456-426614174000',
                    move_coordinates: 'C3',
                    resulting_board_state: boardState,
                    created_at: new Date().toISOString()
                }]
            });

            const res = await request(app)
                .get(`/gamesaves/${fakeMatchId}/moves/1`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/Move retrieved successfully/i);
            expect(res.body.move.move_number).toBe(1);
        });

        it('Fails if move is not found', async () => {
            const fakeMatchId = '111e4567-e89b-12d3-a456-426614174111';

            vi.spyOn(db, 'query').mockResolvedValue({ rows: [] });

            const res = await request(app)
                .get(`/gamesaves/${fakeMatchId}/moves/999`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Move not found/i);
        });
    });

    describe('GET /gamesaves/:matchId/latest', () => {
        it('Retrieves the latest move of a match', async () => {
            const fakeMatchId = '111e4567-e89b-12d3-a456-426614174111';
            const boardState = JSON.stringify({
                size: 5,
                turn: 0,
                players: ['B', 'R'],
                layout: 'B/BR/B.R/R.B.R/B.R.B.R/'
            });

            vi.spyOn(db, 'query').mockResolvedValue({
                rows: [{
                    id: '999e4567-e89b-12d3-a456-426614174999',
                    match_id: fakeMatchId,
                    move_number: 5,
                    player_id: '223e4567-e89b-12d3-a456-426614174001',
                    move_coordinates: 'D4',
                    resulting_board_state: boardState,
                    created_at: new Date().toISOString()
                }]
            });

            const res = await request(app)
                .get(`/gamesaves/${fakeMatchId}/latest`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/Latest move retrieved successfully/i);
            expect(res.body.move.move_number).toBe(5);
        });

        it('Fails if no moves exist for the match', async () => {
            const fakeMatchId = '111e4567-e89b-12d3-a456-426614174111';

            vi.spyOn(db, 'query').mockResolvedValue({ rows: [] });

            const res = await request(app)
                .get(`/gamesaves/${fakeMatchId}/latest`)
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/No moves found for this match/i);
        });
    });
});
