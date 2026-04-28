import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import SignUpForm from '../components/SignUp/SignUpForm';
import { SettingsProvider } from '../context/SettingsContext';
import { I18nProvider } from '../i18n/Provider';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <I18nProvider>
            <SettingsProvider>
                <MemoryRouter>
                    {ui}
                </MemoryRouter>
            </SettingsProvider>
        </I18nProvider>
    );
};

global.fetch = vi.fn();

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

describe('SignUpForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('1. Renders without crashing', () => {
        renderWithProviders(<SignUpForm />);
        expect(document.querySelector('.signup-container')).toBeInTheDocument();
    });

    test('2. Has all input fields', () => {
        renderWithProviders(<SignUpForm />);
        expect(document.getElementById('signup-nickname')).toBeInTheDocument();
        expect(document.getElementById('signup-username')).toBeInTheDocument();
        expect(document.getElementById('signup-email')).toBeInTheDocument();
        expect(document.getElementById('password')).toBeInTheDocument();
    });

    test('3. Toggles password visibility', () => {
        renderWithProviders(<SignUpForm />);
        const passInput = document.getElementById('password') as HTMLInputElement;
        expect(passInput.type).toBe('password');
        const toggleBtn = document.querySelector('.password-toggle-btn, .toggle-btn, button svg') as HTMLElement;
        if (toggleBtn) fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('text');
    });
});