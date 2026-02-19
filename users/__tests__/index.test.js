import { describe, it, expect, afterEach, vi } from 'vitest'
import request from 'supertest'
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
import app from '../index.js'

const db = require('../src/db/db.js');

describe('POST /users/createuser', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns a greeting message for the provided username', async () => {
        const testName = 'Pablo'
        vi.spyOn(db, 'query').mockResolvedValue({
            rows: [{ id: 1, username: testName, email: 'pablo@test.com' }]
        });
        const res = await request(app)
            .post('/users/createuser')
            .send({ 
                username: testName,
                email: 'pablo@test.com', 
                password: 'password123'
            })
            .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Welcome Pablo/i)
       
    })
})
