import { describe, it, expect, afterEach, vi } from 'vitest'
import request from 'supertest'
import { createRequire } from 'node:module';
import bcrypt from 'bcrypt';

const require = createRequire(import.meta.url);
import app from '../index.js'

const db = require('../src/db/db.js');

///////////////////////////////////////////////////////////CREATE USER TESTS//////////////////////////////////////////////////////////////////////////////////////////////
describe('POST /users/createuser', () => {
    const testName = 'Pablo'
    afterEach(() => {
        vi.restoreAllMocks()
    })

    // POSITIVE TEST
    it('returns a greeting message for the provided username', async () => {
        
        vi.spyOn(db, 'query')
            .mockResolvedValueOnce({ rows: [] }) 
            .mockResolvedValueOnce({
                rows: [{username: testName, email: 'pablo@test.com' }]
            });

        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                username: testName,
                nickname: testName,
                email: 'pablo@test.com', 
                password: 'password123',
                photo: "photo"
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Welcome Pablo/i)
       
    })
    // USERNAME IS MISSING
    it('returns 400 if the username is missing', async () => {
        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                email: 'pablo@test.com', 
                password: 'password123'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields") 
    })
    // USERNAME ALREADY EXISTS
    it('returns 400 if the user already exists', async () => {

        
        vi.spyOn(db, 'query').mockResolvedValueOnce({
            rows: [{ username: testName }]
        });

        const res = await request(app)
            .post('/users/createuser')
            .send({ username: testName })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("The username already exists")
    })
    // ABRUPT ERROR
    it('returns 500 if something breaks abruptly',  async () => {
        vi.spyOn(db, 'query').mockRejectedValueOnce(new Error("Database connection failed"));

        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                username: testName,
                nickname: testName,
                email: 'pablo@test.com', 
                password: 'password123',
                photo: "photo"
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(500)
        expect(res.body.error).toBe("Internal server error") 
    })
})

///////////////////////////////////////////////////////////FIND USER BY USER NAME TESTS//////////////////////////////////////////////////////////////////////////////////////////////
describe('POST /users/findUserByUsername', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    //POSITIVE TEST
    it('returns some data abour the user', async () => {
        const testName = 'Pablo'
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{username: testName, nickname: testName, photo: "photo", email: 'pablo@test.com' }]
        });
        const res = await request(app)
            .post('/users/findUserByUsername')
            .send({ 
                username: testName,
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('username', testName);
        expect(res.body).toHaveProperty('nickname', testName);
        expect(res.body).toHaveProperty('email', 'pablo@test.com');
        expect(res.body).toHaveProperty('photo', 'photo');
        expect(res.body).not.toHaveProperty('password');
       
    })
    // NOT PASSING A USERNAME
    it('returns 400 if no username is provided', async () => {
        const res = await request(app)
            .post('/users/findUserByUsername')
            .send({ 
                // Enviamos el body vacío o sin el campo username
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("The username is required")
    })
    // USER NOT FOUND
    it('returns 404 if the user is not found in the database', async () => {
        vi.spyOn(db, 'query').mockResolvedValueOnce({
            rows: [] 
        });

        const res = await request(app)
            .post('/users/findUserByUsername')
            .send({ username: 'UsuarioFantasma' })
            .set('Accept', 'application/json')

        expect(res.status).toBe(404)
        expect(res.body.error).toBe("User not found")
    })
    // ABRUPT ERROR
    it('returns 500 if something breaks abruptly',  async () => {
        vi.spyOn(db, 'query').mockRejectedValueOnce(new Error("Database connection failed"));

        const res = await request(app)
            .post('/users/findUserByUsername')
            .send({ 
                username: 'test',
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(500)
        expect(res.body.error).toBe("Internal server error") 
    })
})

///////////////////////////////////////////////////////////LOGIN USER TESTS//////////////////////////////////////////////////////////////////////////////////////////////
describe('POST /users/loginUser', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })
    // POSITIVE TEST
    it('returns 200 and user data without password if credentials are correct', async () => {
        const testName = 'Pablo'
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{username: testName, nickname: testName, password: "password123", photo: "photo", email: 'pablo@test.com' }]
        });
        vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
        const res = await request(app)
            .post('/users/loginUser')
            .send({ 
                username: testName,
                password: "password123"
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('username', testName);
        expect(res.body).toHaveProperty('nickname', testName);
        expect(res.body).toHaveProperty('email', 'pablo@test.com');
        expect(res.body).toHaveProperty('photo', 'photo');
        expect(res.body).not.toHaveProperty('password');
       
    })
    // USERNAME OR PASSWORD MISSING
    it('returns 400 if fields are missing', async () => {
        const res = await request(app)
            .post('/users/loginUser')
            .send({ 
                username: 'Pablo'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields")
    })
    // PASSWORD IS INCORRECT
    it('returns 401 if the password is incorrect', async () => {
        const testUser = { username: 'Pablo', password: 'password123' }
        
        vi.spyOn(db, 'query').mockResolvedValueOnce({
            rows: [testUser]
        });
        vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

        const res = await request(app)
            .post('/users/loginUser')
            .send({ 
                username: 'Pablo',
                password: 'WRONG_PASSWORD' 
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Invalid username or password")
    })
    // USER NOT EXISTS WITH THAT USERNAME
    it('returns 401 if the user does not exist', async () => {
        vi.spyOn(db, 'query').mockResolvedValueOnce({
            rows: [] 
        });

        const res = await request(app)
            .post('/users/loginUser')
            .send({ 
                username: 'Fantasma',
                password: 'password123'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Invalid username or password") 
    })
    // ABRUPT ERROR
    it('returns 500 if something breaks abruptly',  async () => {
        vi.spyOn(db, 'query').mockRejectedValueOnce(new Error("Database connection failed"));

        const res = await request(app)
            .post('/users/loginUser')
            .send({ 
                username: 'Fantasma',
                password: 'password123'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(500)
        expect(res.body.error).toBe("Internal server error") 
    })
})