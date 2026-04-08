import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const mockSettings = {
  neonMode: false,
  colorBlindMode: false,
};

vi.mock('../i18n/Provider', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/SettingsContext', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSettings: () => mockSettings,
}));

vi.mock('../components/MainMenu', () => ({
  default: () => <div>Menu Screen</div>,
}));

vi.mock('../components/GameScreen/GameScreen', () => ({
  default: () => <div>Game Screen</div>,
}));

vi.mock('../components/Login/RegisterForm', () => ({
  default: () => <div>Login Screen</div>,
}));

vi.mock('../components/SignUp/SignUpForm', () => ({
  default: () => <div>Sign Up Screen</div>,
}));

vi.mock('../components/HistoryPage/HistoryPage', () => ({
  default: () => <div>History Screen</div>,
}));

describe('App routing shell', () => {
  beforeEach(() => {
    mockSettings.neonMode = false;
    mockSettings.colorBlindMode = false;
  });

  it('renders the login route with the default visual classes', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
    expect(container.querySelector('.App')).toBeInTheDocument();
    expect(container.querySelector('.App')).not.toHaveClass('neon-mode');
    expect(container.querySelector('.App')).not.toHaveClass('color-blind');
  });

  it('applies enabled visual modes and redirects unknown routes to login', () => {
    mockSettings.neonMode = true;
    mockSettings.colorBlindMode = true;

    const { container } = render(
      <MemoryRouter initialEntries={['/missing-route']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
    expect(container.querySelector('.App')).toHaveClass('neon-mode');
    expect(container.querySelector('.App')).toHaveClass('color-blind');
  });
});
