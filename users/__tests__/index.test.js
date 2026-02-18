import { describe, it, expect, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../index.js'
describe('POST /users/createuser', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns a greeting message for the provided username', async () => {
        const res = await request(app)
            .post('/users/createuser')
            .send({ username: 'Pablo' + Date.now() })
            .set('Accept', 'application/json')

        console.log(res.body)
        console.log(res.text)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Welcome Pablo/i)
    })
})
