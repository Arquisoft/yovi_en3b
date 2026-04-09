import { describe, expect, test, vi, beforeEach } from 'vitest';
import { waitFor, screen } from '@testing-library/react'; 

vi.mock('../App', () => ({
  default: () => <div data-testid="app-container">App Rendered</div>, // Simple app mock
}));

// Mock global de Audio
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
  return {
    play: vi.fn().mockResolvedValue(undefined), // Mock play
    pause: vi.fn(), // Mock pause
    load: vi.fn(), // Mock load
    loop: false, // Prop
    volume: 1, // Prop
  };
}));

describe('main entry point', () => {
  beforeEach(() => {
    document.body.innerHTML = ''; // Clean DOM
    vi.resetModules(); // Re-run the code inside main.tsx each time
    vi.clearAllMocks(); // Reset mock history
  });

  test('should initialize and render app if root element exists', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);

    await import('../main'); // Run entry point

    await waitFor(() => {
      // We use getByTestId to check if our mocked App component rendered correctly
      expect(screen.getByTestId('app-container')).toBeDefined();
    }, { timeout: 2000 });
  });

  test('should not render anything if root element is missing', async () => {
    await import('../main');
    const appContainer = screen.queryByTestId('app-container'); 
    expect(appContainer).toBeNull(); // No debería existir
    expect(document.body.innerHTML).not.toContain('App Rendered'); 
  });
});