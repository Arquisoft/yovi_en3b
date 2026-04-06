import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import { createRequire } from 'node:module'
import { newDb } from 'pg-mem'

// -----------------------------------------------------------------------
// 1. KONTROLLÜ YÜKLEME VE SANAL VERİTABANI (Kusursuz Altyapı)
// -----------------------------------------------------------------------
const require = createRequire(import.meta.url);
const memDb = newDb();

memDb.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid',
    impure: true,
    implementation: () => require('crypto').randomUUID()
});

const pg = memDb.adapters.createPg();
const mockPool = new pg.Pool();

const db = require('../../src/db/db.js');

if (db.query) vi.spyOn(db, 'query').mockImplementation((...args) => mockPool.query(...args));
if (db.connect) vi.spyOn(db, 'connect').mockImplementation((...args) => mockPool.connect(...args));
if (db.end) vi.spyOn(db, 'end').mockImplementation((...args) => mockPool.end(...args));

const app = require('../../index.js');

// -----------------------------------------------------------------------
// 2. VERİTABANI TABLOLARINI HAZIRLA (Arrange)
// -----------------------------------------------------------------------
beforeAll(async () => {
    // 1. Önce users tablosunu kuruyoruz (Çünkü matches tablosu buraya bağlı!)
    await mockPool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nickname VARCHAR(50) NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            photo VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Sonra matches tablosunu kuruyoruz
    await mockPool.query(`
        CREATE TABLE IF NOT EXISTS matches (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            blue_player_id UUID NOT NULL REFERENCES users(id),
            red_player_id UUID REFERENCES users(id),
            is_bot BOOLEAN DEFAULT false,
            bot_difficulty INT DEFAULT 0,
            winner_id UUID REFERENCES users(id),
            status VARCHAR(20) DEFAULT 'in_progress',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ended_at TIMESTAMP
        );
    `);
});

beforeEach(async () => {
    await mockPool.query('TRUNCATE TABLE matches CASCADE;');
    await mockPool.query('TRUNCATE TABLE users CASCADE;');
});

afterAll(async () => {
    await mockPool.end();
    vi.restoreAllMocks();
});

// -----------------------------------------------------------------------
// 3. ENTEGRASYON TESTLERİ: Matches API
// -----------------------------------------------------------------------
describe('INTEGRATION TESTS: Matches API', () => {

    // Testlerimizde kullanacağımız geçici değişkenler
    let bluePlayerId;
    let redPlayerId;

    // Her testten önce veritabanına 2 tane sahte oyuncu ekleyip ID'lerini alıyoruz
    beforeEach(async () => {
        const blueUser = await mockPool.query(`
            INSERT INTO users (nickname, username, email, password, photo) 
            VALUES ('Blue', 'player1', 'blue@test.com', 'pass', 'b.png') RETURNING id;
        `);
        const redUser = await mockPool.query(`
            INSERT INTO users (nickname, username, email, password, photo) 
            VALUES ('Red', 'player2', 'red@test.com', 'pass', 'r.png') RETURNING id;
        `);

        bluePlayerId = blueUser.rows[0].id;
        redPlayerId = redUser.rows[0].id;
    });

    describe('POST /matches/create', () => { // <-- URL YOLUNU KENDİ PROJENE GÖRE KONTROL ET!
        
        it('should successfully create a match between two real players', async () => {
            const res = await request(app)
                .post('/matches/create') 
                .send({
                    bluePlayerId: bluePlayerId,
                    redPlayerId: redPlayerId,
                    isBot: false
                })
                .set('Accept', 'application/json');

            // 1. API 201 döndü mü?
            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Match created succesfully');

            // 2. Veritabanına gerçekten yazıldı mı?
            const { rows } = await mockPool.query('SELECT * FROM matches WHERE blue_player_id = $1', [bluePlayerId]);
            expect(rows.length).toBe(1);
            expect(rows[0].is_bot).toBe(false);
            expect(rows[0].red_player_id).toBe(redPlayerId);
        });

        it('should successfully create a match against a BOT', async () => {
            const res = await request(app)
                .post('/matches/create')
                .send({
                    bluePlayerId: bluePlayerId,
                    isBot: true,
                    botDifficulty: 2
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(201);

            const { rows } = await mockPool.query('SELECT * FROM matches WHERE blue_player_id = $1', [bluePlayerId]);
            expect(rows.length).toBe(1);
            expect(rows[0].is_bot).toBe(true);
            expect(rows[0].bot_difficulty).toBe(2);
            // Bot olduğu için red_player_id null olmalı
            expect(rows[0].red_player_id).toBeNull(); 
        });

        it('should return 400 if playing against a real player but redPlayerId is missing', async () => {
            const res = await request(app)
                .post('/matches/create')
                .send({
                    bluePlayerId: bluePlayerId,
                    isBot: false
                    // redPlayerId GÖNDERMİYORUZ!
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("If you don't play against a BOT, you need a Red Player ID.");
        });

        it('should return 400 if playing against a BOT but difficulty is missing', async () => {
            const res = await request(app)
                .post('/matches/create')
                .send({
                    bluePlayerId: bluePlayerId,
                    isBot: true
                    // botDifficulty GÖNDERMİYORUZ!
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("If you play against a BOT, you must select a difficulty.");
        });

    });
});