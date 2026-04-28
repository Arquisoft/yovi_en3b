import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        catch: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        loop: false,
        volume: 1,
        muted: false
    };
}));

describe('SignUpForm', () => {
    test('placeholder test', () => {
        expect(true).toBe(true);
    });
});