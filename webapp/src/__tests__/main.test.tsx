
import { beforeEach, describe, expect, test, vi } from 'vitest';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
  default: { createRoot: createRootMock },
}));

vi.mock('../App', () => ({
  default: () => <div>App</div>,
}));

describe('main entry', () => {
  beforeEach(() => {
    renderMock.mockClear();
    createRootMock.mockClear();
    document.body.innerHTML = '';
    vi.resetModules();
  });

  test('renders app when root element exists', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import('../main');

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  test('logs error when root element is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await import('../main');

    expect(errorSpy).toHaveBeenCalledWith('Could not find root element.');
    errorSpy.mockRestore();
  });
});
