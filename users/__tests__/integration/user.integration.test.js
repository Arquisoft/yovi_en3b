import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcrypt'
import { createRequire } from 'node:module'
import { newDb } from 'pg-mem'

// -----------------------------------------------------------------------
// 1. KONTROLLÜ YÜKLEME SİSTEMİ
// Node.js'in o aceleci yapısını durdurmak için senin unit testlerindeki
// "createRequire" taktiğini kullanıyoruz.
// -----------------------------------------------------------------------
const require = createRequire(import.meta.url);

// -----------------------------------------------------------------------
// 2. SANAL VERİTABANINI KUR
// -----------------------------------------------------------------------
const memDb = newDb();
memDb.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid',
    impure: true,
    implementation: () => '3fa85f64-5717-4562-b3fc-2c963f66afa6' 
});

const pg = memDb.adapters.createPg();
const mockPool = new pg.Pool();

// -----------------------------------------------------------------------
// 3. VERİTABANI DOSYASINI ELE GEÇİR (BÜTÜN KAPILARI KİLİTLE)
// Uygulama uyanmadan önce db dosyasını çağırıp tüm fonksiyonlarını çalıyoruz!
// -----------------------------------------------------------------------
const db = require('../../src/db/db.js');

// Sadece query değil, bağlantı (connect) komutunu da yakalamak zorundayız!
if (db.query) {
    vi.spyOn(db, 'query').mockImplementation((...args) => mockPool.query(...args));
}
if (db.connect) {
    vi.spyOn(db, 'connect').mockImplementation((...args) => mockPool.connect(...args));
}
if (db.end) {
    vi.spyOn(db, 'end').mockImplementation((...args) => mockPool.end(...args));
}

// -----------------------------------------------------------------------
// 4. UYGULAMAYI ŞİMDİ BAŞLAT
// Artık uygulama db'ye gitmeye çalıştığında bizim kapana kısılacak.
// -----------------------------------------------------------------------
const app = require('../../index.js');


// -----------------------------------------------------------------------
// 5. VERİTABANI TABLOLARINI HAZIRLA (Arrange)
// -----------------------------------------------------------------------
beforeAll(async () => {
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
});

beforeEach(async () => {
    await mockPool.query('TRUNCATE TABLE users CASCADE;');
});

afterAll(async () => {
    await mockPool.end();
    vi.restoreAllMocks(); // Test bitince her şeyi temizle
});


// -----------------------------------------------------------------------
// 6. ENTEGRASYON TESTLERİ
// -----------------------------------------------------------------------
describe('INTEGRATION TESTS: Users API', () => {

    describe('POST /users/createuser', () => {
        it('should save the user to the database with valid information', async () => {
            const res = await request(app)
                .post('/users/createuser')
                .send({
                    username: 'yovi_master',
                    nickname: 'Yovi',
                    email: 'yovi@game.com',
                    password: 'superSecretPassword123',
                    avatarId: 'avatar.png'
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(201);
            
            const { rows } = await mockPool.query('SELECT * FROM users WHERE username = $1', ['yovi_master']);
            expect(rows.length).toBe(1);
            expect(rows[0].email).toBe('yovi@game.com');
            expect(rows[0].password).not.toBe('superSecretPassword123');
        });
    });

    describe('POST /users/findUserByUsername', () => {
        it('should return an existing user without the password', async () => {
            await mockPool.query(`
                INSERT INTO users (nickname, username, email, password, photo) 
                VALUES ('TestNick', 'searchTarget', 'search@test.com', 'hashedpass', 'photo.png')
            `);

            const res = await request(app)
                .post('/users/findUserByUsername')
                .send({ username: 'searchTarget' })
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.username).toBe('searchTarget');
            expect(res.body.email).toBe('search@test.com');
            expect(res.body).not.toHaveProperty('password');
        });
    });

    describe('POST /users/loginUser', () => {
        it('should successfully log in when the correct password is provided', async () => {
            const plainPassword = 'myPassword123';
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            await mockPool.query(`
                INSERT INTO users (nickname, username, email, password, photo) 
                VALUES ('LoginNick', 'loginTarget', 'login@test.com', $1, 'photo.png')
            `, [hashedPassword]);

            const res = await request(app)
                .post('/users/loginUser')
                .send({ 
                    username: 'loginTarget',
                    password: plainPassword 
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.username).toBe('loginTarget');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should return 401 if an incorrect password is provided, even if the user exists', async () => {
            const hashedPassword = await bcrypt.hash('correctPassword', 10);
            await mockPool.query(`
                INSERT INTO users (nickname, username, email, password, photo) 
                VALUES ('LoginNick', 'wrongPassTarget', 'wrong@test.com', $1, 'photo.png')
            `, [hashedPassword]);

            const res = await request(app)
                .post('/users/loginUser')
                .send({ 
                    username: 'wrongPassTarget',
                    password: 'WRONG_PASSWORD_!@#' 
                })
                .set('Accept', 'application/json');

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid username or password');
        });
    });
});