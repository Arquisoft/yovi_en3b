import { describe, expect, test } from 'vitest';
import { generateBoard, barycentricToAxial } from '../components/GameScreen/gridUtils';

describe('gridUtils', () => {
  test('generateBoard creates correct number of cells for size 1', () => {
    const cells = generateBoard(1);
    expect(cells.length).toBe(1);
    expect(cells[0]).toMatchObject({ x: 0, y: 0, z: 0, q: 0 });
    expect(cells[0].r).toBeCloseTo(0);
  });

  test('generateBoard size 3 yields triangular layout', () => {
    const cells = generateBoard(3);
    // Total cells = n(n+1)/2
    expect(cells.length).toBe(6);
    // Top cell should be centered (q=0, r=-2)
    const top = cells.find((c) => c.x === 2 && c.y === 0 && c.z === 0);
    expect(top).toBeDefined();
    if (top) {
      expect(top.q).toBe(0);
      expect(top.r).toBe(-2);
    }
  });

  test('barycentricToAxial maps coordinates correctly', () => {
    const axial = barycentricToAxial(2, 1, 0);
    expect(axial).toEqual({ q: 1, r: -2 });
  });
});
