import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

type MockAudio = {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  volume: number;
  muted: boolean;
  loop: boolean;
};

const mockAudios: MockAudio[] = [];

vi.stubGlobal(
  'Audio',
  vi.fn(function () {
    const audio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      volume: 1,
      muted: false,
      loop: false,
    };

    mockAudios.push(audio);
    return audio;
  })
);

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudios.length = 0;
  });

  it('throws when useSettings is called outside the provider', () => {
    expect(() => renderHook(() => useSettings())).toThrow(
      'useSettings debe usarse dentro de SettingsProvider'
    );
  });

  it('does not create a sound effect audio instance while muted', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(mockAudios).toHaveLength(1);

    act(() => {
      result.current.setIsMuted(true);
    });

    act(() => {
      result.current.playSound('click.mp3');
    });

    expect(mockAudios).toHaveLength(1);
  });

  it('swallows synchronous audio constructor errors when playing a sound', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );
    const audioConstructor = globalThis.Audio as unknown as ReturnType<typeof vi.fn>;

    const { result } = renderHook(() => useSettings(), { wrapper });
    audioConstructor.mockImplementationOnce(() => {
      throw new Error('Audio unavailable');
    });

    expect(() => {
      act(() => {
        result.current.playSound('click.mp3');
      });
    }).not.toThrow();
  });
});
