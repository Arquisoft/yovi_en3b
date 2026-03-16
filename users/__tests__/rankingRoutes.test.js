import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const router = require('../src/modules/ranking/entry-points/rankingRoutes.js');

const hasRoute = (path, method) => {
  return router.stack.some((layer) => {
    if (!layer.route) return false;
    if (layer.route.path !== path) return false;
    return Boolean(layer.route.methods[method]);
  });
};

describe('rankingRoutes', () => {
  it('registers add route', () => {
    expect(hasRoute('/add', 'post')).toBe(true);
  });

  it('registers update and get routes', () => {
    expect(hasRoute('/update/:userId', 'put')).toBe(true);
    expect(hasRoute('/:userId', 'get')).toBe(true);
  });
});
