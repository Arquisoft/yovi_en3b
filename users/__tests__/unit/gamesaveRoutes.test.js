import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const router = require('../../src/modules/gamesave/entry-points/gamesaveRoutes.js');

const findRoute = (path, method) => {
  return router.stack.some((layer) => {
    if (!layer.route) return false;
    if (layer.route.path !== path) return false;
    return Boolean(layer.route.methods[method]);
  });
};

describe('gamesaveRoutes', () => {
  it('registers save route', () => {
    expect(findRoute('/save', 'post')).toBe(true);
  });

  it('registers match routes', () => {
    expect(findRoute('/:matchId', 'get')).toBe(true);
    expect(findRoute('/:matchId/moves/:moveNumber', 'get')).toBe(true);
    expect(findRoute('/:matchId/latest', 'get')).toBe(true);
  });
});
