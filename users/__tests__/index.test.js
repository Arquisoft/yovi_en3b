import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

const mockPost = vi.fn();
app._setAxios({ post: mockPost });

describe('Index /play endpoint', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('returns 400 if bot_id is invalid', async () => {
    const res = await request(app).get('/play?bot_id=hacker_bot&position={}');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El bot especificado no es válido.");
  });

  it('returns 400 if position parameter is missing', async () => {
    const res = await request(app).get('/play?bot_id=random_bot');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Falta el parámetro 'position' en la URL");
  });

  it('returns 400 if position is not valid JSON', async () => {
    const res = await request(app).get('/play?bot_id=random_bot&position=invalid_json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El parámetro position no es un JSON válido");
  });

  it('returns 200 and coords when Rust engine resolves successfully', async () => {
    const mockCoords = { x: 1, y: 2, z: 0 };
    mockPost.mockResolvedValue({ data: { coords: mockCoords } });
    const validPosition = JSON.stringify({ size: 4, turn: 0, players: ["B", "R"], layout: "..." });
    const res = await request(app).get(`/play?bot_id=easy_bot&position=${encodeURIComponent(validPosition)}`);
    expect(mockPost).toHaveBeenCalledWith('http://gamey:4000/v1/ybot/choose/easy_bot', expect.any(Object));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ coords: mockCoords });
  });

  it('defaults to random_bot and returns 200 if action is returned (e.g. swap)', async () => {
    mockPost.mockResolvedValue({ data: { action: 'swap' } });
    const validPosition = JSON.stringify({ size: 4 });
    const res = await request(app).get(`/play?position=${encodeURIComponent(validPosition)}`);
    expect(mockPost).toHaveBeenCalledWith('http://gamey:4000/v1/ybot/choose/random_bot', expect.any(Object));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ action: 'swap' });
  });

  it('returns generic data when Rust engine returns an unknown format', async () => {
    mockPost.mockResolvedValue({ data: { some_other_field: true } });
    const validPosition = JSON.stringify({ size: 4 });
    const res = await request(app).get(`/play?position=${encodeURIComponent(validPosition)}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ some_other_field: true });
  });

  it('returns 502 when Rust engine connection fails', async () => {
    mockPost.mockRejectedValue(new Error('Connection refused'));
    const validPosition = JSON.stringify({ size: 4 });
    const res = await request(app).get(`/play?position=${encodeURIComponent(validPosition)}`);
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("Rust module failed");
  });
});