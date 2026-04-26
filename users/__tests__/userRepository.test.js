import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const userRepository = require('../src/modules/user/data-access/userRepository.js');
const userQueries = require('../src/modules/user/data-access/userQueries.js');
const db = require('../src/db/db.js');

describe('userRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates user with expected query and values', async () => {
    const userData = {
      username: 'alice',
      email: 'alice@test.com',
      password: 'hashed',
      photo: 'avatar1',
      nickname: 'Ali',
    };
    const createdUser = { id: 'u1', ...userData };

    vi.spyOn(db, 'query').mockResolvedValue({ rows: [createdUser] });

    const result = await userRepository.createUser(userData);

    expect(db.query).toHaveBeenCalledWith(userQueries.createUser, [
      'alice',
      'alice@test.com',
      'hashed',
      'avatar1',
      'Ali',
    ]);
    expect(result).toEqual(createdUser);
  });

  it('finds user by username', async () => {
    const row = { id: 'u1', username: 'alice' };
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [row] });

    const result = await userRepository.findUserByUsername('alice');

    expect(db.query).toHaveBeenCalledWith(userQueries.findUserByUsername, ['alice']);
    expect(result).toEqual(row);
  });

  it('finds user by email', async () => {
    const row = { id: 'u2', email: 'bob@test.com' };
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [row] });

    const result = await userRepository.findUserByEmail('bob@test.com');

    expect(db.query).toHaveBeenCalledWith(userQueries.findUserByEmail, ['bob@test.com']);
    expect(result).toEqual(row);
  });

  it('updates user password', async () => {
    const updated = { id: 'u1', username: 'alice' };
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [updated] });

    const result = await userRepository.updateUserPassword('alice', 'new-hash');

    expect(db.query).toHaveBeenCalledWith(userQueries.updateUserPassword, ['new-hash', 'alice']);
    expect(result).toEqual(updated);
  });

  it('updates user nickname and photo', async () => {
    const updated = { id: 'u1', username: 'alice', nickname: 'Alice2', photo: 'avatar2' };
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [updated] });

    const result = await userRepository.updateUserNicknameAndPhoto('alice', 'Alice2', 'avatar2');

    expect(db.query).toHaveBeenCalledWith(userQueries.updateUserNicknameAndPhoto, ['Alice2', 'avatar2', 'alice']);
    expect(result).toEqual(updated);
  });

  it('updates user photo', async () => {
    const updated = { id: 'u1', username: 'alice', photo: 'avatar3' };
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [updated] });

    const result = await userRepository.updateUserPhoto('alice', 'avatar3');

    expect(db.query).toHaveBeenCalledWith(userQueries.updateUserPhoto, ['avatar3', 'alice']);
    expect(result).toEqual(updated);
  });

  it('finds user by id', async () => {
    const row = { id: 'u3', username: 'charlie' };
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [row] });

    const result = await userRepository.findUserById('u3');

    expect(db.query).toHaveBeenCalledWith(userQueries.findUserById, ['u3']);
    expect(result).toEqual(row);
  });
});
