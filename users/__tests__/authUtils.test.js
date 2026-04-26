import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { generateUserToken, verifyToken } = require('../src/auth/authUtils.js');

describe('authUtils', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  it('generates a valid JWT token for a user', () => {
    const token = generateUserToken({ id: 'u1', username: 'alice' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    expect(typeof token).toBe('string');
    expect(payload.id).toBe('u1');
    expect(payload.username).toBe('alice');
  });

  it('returns 401 when token is missing', () => {
    const req = { headers: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied: No token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next for a valid token', () => {
    const token = generateUserToken({ id: 'u2', username: 'bob' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(req.user.id).toBe('u2');
    expect(req.user.username).toBe('bob');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
