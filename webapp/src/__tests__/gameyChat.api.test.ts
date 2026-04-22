import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildYenLayout,
  requestBotChatReply,
} from '../components/GameScreen/gameyChat.api';

describe('gamey chat API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('serializes the board state into YEN row order', () => {
    expect(
      buildYenLayout(3, {
        '2-0-0': 1,
        '1-1-0': 2,
        '0-0-2': 1,
      }),
    ).toBe('B/.R/B..');
  });

  it('sends the board state and normalized chat history to Gamey', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          api_version: 'v1',
          bot_id: 'robot',
          difficulty: 'hard',
          reply: 'I can see the board now.',
        }),
    } as Response);

    await expect(
      requestBotChatReply({
        size: 3,
        currentPlayer: 2,
        boardState: {
          '2-0-0': 1,
          '1-1-0': 2,
          '0-0-2': 1,
        },
        messages: [
          { sender: 'player', text: 'What do you think?' },
          { sender: 'bot', text: 'I am checking the board.' },
        ],
        difficulty: 'hard',
        botId: 'robot',
      }),
    ).resolves.toBe('I can see the board now.');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/v1/ybot/chat/robot?difficulty=hard',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yen: {
            size: 3,
            turn: 1,
            players: ['B', 'R'],
            layout: 'B/.R/B..',
          },
          messages: [
            { role: 'player', content: 'What do you think?' },
            { role: 'assistant', content: 'I am checking the board.' },
          ],
        }),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('surfaces structured backend error messages', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            message: 'Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable',
          }),
        ),
    } as Response);

    await expect(
      requestBotChatReply({
        size: 3,
        currentPlayer: 1,
        boardState: {},
        messages: [{ sender: 'player', text: 'Hello?' }],
        difficulty: 'medium',
      }),
    ).rejects.toThrow('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable');
  });

  it('surfaces backend message when response is 200 but payload is an error object', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          api_version: 'v1',
          bot_id: 'llm_bot',
          message: 'LLM chat failed: insufficient credits',
        }),
    } as Response);

    await expect(
      requestBotChatReply({
        size: 3,
        currentPlayer: 1,
        boardState: {},
        messages: [{ sender: 'player', text: 'Hello?' }],
        difficulty: 'medium',
      }),
    ).rejects.toThrow('LLM chat failed: insufficient credits');
  });

  it('times out hanging chat requests with a clear error', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(
      () => new Promise<Response>(() => {}) as Promise<Response>,
    );

    const replyPromise = requestBotChatReply({
      size: 3,
      currentPlayer: 1,
      boardState: {},
      messages: [{ sender: 'player', text: 'Hello?' }],
      difficulty: 'medium',
    });
    const replyExpectation = expect(replyPromise).rejects.toThrow(
      'Gamey chat timed out after 15s. Check that the gamey service is running and try again.',
    );

    await vi.advanceTimersByTimeAsync(15_000);

    await replyExpectation;
  });
});
