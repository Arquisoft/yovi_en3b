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
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
                rows: [{username: testName, nickname: testName, email: 'pablo@test.com', password: 'password123', photo: "photo"}]
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
                nickname: testName,
                email: 'pablo@test.com', 
                password: 'password123',
                photo: 'photo'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields") 
    })
    // EMAIL IS MISSING
    it('returns 400 if the email is missing', async () => {
        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                nickname: testName,
                username: testName,
                password: 'password123',
                photo: 'photo'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields") 
    })
     // PASSWORD IS MISSING
    it('returns 400 if the password is missing', async () => {
        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                nickname: testName,
                username: testName,
                email: 'pablo@test.com', 
                photo: 'photo'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields") 
    })
     // SHORT PASSWORD
    it('returns 400 if the password is too short', async () => {
        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                nickname: testName,
                username: testName,
                email: 'pablo@test.com', 
                password: 'pas',
                photo: 'photo'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("The password must have at least 8 characters") 
    })
    // NICKNAME IS MISSING
    it('returns 400 if the nickname is missing', async () => {
        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                password: 'password123',
                username: testName,
                email: 'pablo@test.com', 
                photo: 'photo'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields") 
    })
    // PASSWORD IS MISSING
    it('returns 400 if the password is missing', async () => {
        vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                username: testName,
                nickname: testName,
                email: 'pablo@test.com',
                photo: "photo"
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
            .send({ username: testName,
                nickname: testName,
                email: 'pablo@test.com', 
                password: 'password123',
                photo: "photo" })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("The username already exists")
    })
    // EMAIL ALREADY EXISTS
    it('returns 400 if there already exists a user with that email', async () => {

        
        vi.spyOn(db, 'query')
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
                rows: [{ email: 'pablo@test.com' }]
            });

        const res = await request(app)
            .post('/users/createuser')
            .send({ username: testName,
                nickname: testName,
                email: 'pablo@test.com', 
                password: 'password123',
                photo: "photo" })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("The email already exists")
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

///////////////////////////////////////////////////////////ADDITIONAL EDGE CASE TESTS//////////////////////////////////////////////////////////////////////////////////////////////
describe('Edge Cases and Additional Coverage', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    // Test for password field validation in createUser
    it('returns 400 if password is empty string in createuser', async () => {
        vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                username: 'TestUser',
                nickname: 'Test',
                email: 'test@test.com',
                password: '',
                photo: "photo"
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields")
    });

    // Test for bcrypt error during user creation
    it('returns 500 if bcrypt fails during password hashing', async () => {
        vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });
        vi.spyOn(bcrypt, 'hash').mockRejectedValueOnce(new Error("Bcrypt error"));

        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                username: 'TestUser',
                nickname: 'Test',
                email: 'test@test.com',
                password: 'password123',
                photo: "photo"
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(500)
        expect(res.body.error).toBe("Internal server error")
    });

    // Test for bcrypt compare error during login
    it('returns 500 if bcrypt compare fails during login', async () => {
        vi.spyOn(db, 'query').mockResolvedValueOnce({
            rows: [{username: 'Pablo', password: 'hash123', nickname: 'Pablo'}]
        });
        vi.spyOn(bcrypt, 'compare').mockRejectedValueOnce(new Error("Bcrypt compare error"));

        const res = await request(app)
            .post('/users/loginUser')
            .send({ 
                username: 'Pablo',
                password: 'password123'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(500)
        expect(res.body.error).toBe("Internal server error")
    });

    // Test for findUserByUsername with empty password field in response
    it('returns user data without password in findUserByUsername', async () => {
        const testName = 'Pablo'
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{username: testName, nickname: testName, photo: "photo", email: 'pablo@test.com', password: 'hashed123' }]
        });

        const res = await request(app)
            .post('/users/findUserByUsername')
            .send({ 
                username: testName,
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).not.toHaveProperty('password');
    });

    // Test for login with both missing username and password  
    it('returns 400 if both username and password are missing', async () => {
        const res = await request(app)
            .post('/users/loginUser')
            .send({ })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields")
    });

    // Test for login with only missing password
    it('returns 400 if only password is missing in login', async () => {
        const res = await request(app)
            .post('/users/loginUser')
            .send({ username: 'TestUser' })
            .set('Accept', 'application/json')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("Missing fields")
    });
})