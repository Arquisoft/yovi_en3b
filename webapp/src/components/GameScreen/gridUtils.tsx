export interface Cell {
  x: number;
  y: number;
  z: number;
  q: number;
  r: number;
}

/**
 * Generates a triangular board of hexagonal cells
 * @param size - Number of cells of each side of the triangle
 * @returns An array of cell objects with their cube (x,y,z) and axial (q,r,s) coordinates
 * - The board is generated row by row (x-axis)
 * - Each row's horizontal position (q) is offset to ensure the triangle is centered and equilateral
 */
export const generateBoard = (size: number) => {
  const cells = [];
  const targetSum = size - 1;

  // x is the row (from top to bottom)
  for (let x = targetSum; x >= 0; x--) {
    // To center the peak, 'q' must start at a negative value 
    // that depends on the number of elements in the current row.
    // Row x=3 (peak) -> 1 element -> q=0
    // Row x=0 (base) -> 4 elements -> q varies to center on 0

    const rowLength = targetSum - x;

    for (let y = 0; y <= rowLength; y++) {
      const z = targetSum - x - y;

      // r --> Vertical row
      // q --> Column (- half of the offset)
      const r = -x;
      const q = y - (targetSum - x);

      cells.push({ x, y, z, q, r, s: -q - r });
    }
  }
  return cells;
};

/**
 * Converts barycentric (cube) coordinates to axial   coordinates
 * @param x - The 'x' component (row / vertical axis)
 * @param y - The 'y' component 
 * @param z - The 'z' component
 * @returns An object containing 'q' and 'r' (axial coordinates)
 * Mapping (q = y, r = x) ensures the top of the triangle is correctly aligned
 */
export const barycentricToAxial = (x: number, y: number, _z: number) => {
  return { q: y, r: -x };
};