
import type { Cell } from './gridUtils';
export const checkWin = (boardState: Record<string, number>, player: number, size: number, allCells: Cell[]) => {
    // 1. Get all cells belonging to the current player
    const playerCells = allCells.filter(c => boardState[`${c.x}-${c.y}-${c.z}`] === player);
    
    // Safety check: a 'Y' shape needs a minimum number of pieces to actually connect
    if (playerCells.length < size) return false;

    const playerCellsMap = new Map();
    playerCells.forEach(c => playerCellsMap.set(`${c.x}-${c.y}-${c.z}`, c));

    const visited = new Set<string>();
    const dirs = [
        {x:1, y:-1, z:0}, {x:1, y:0, z:-1}, {x:0, y:1, z:-1},
        {x:-1, y:1, z:0}, {x:-1, y:0, z:1}, {x:0, y:-1, z:1}
    ];

    // 2. We use BFS to find all connected groups of the same color
    for (const startCell of playerCells) {
        const startKey = `${startCell.x}-${startCell.y}-${startCell.z}`;
        if (visited.has(startKey)) continue;

        const queue = [startCell];
        const sidesInGroup = new Set<string>(); // Tracks unique sides touched by this specific group
        visited.add(startKey);

        let head = 0;
        while (head < queue.length) {
            const curr = queue[head++];

            if (curr.x === 0)         sidesInGroup.add('base');     // Bottom line
            if (curr.y === 0)         sidesInGroup.add('left');     // Left side
            if (curr.z === 0)         sidesInGroup.add('right');    // Right side

            // Check neighbors to expand the connected group
            for (const d of dirs) {
                const nx = curr.x + d.x;
                const ny = curr.y + d.y;
                const nz = curr.z + d.z;
                const nbKey = `${nx}-${ny}-${nz}`;

                const neighbor = playerCellsMap.get(nbKey); 

                if (neighbor && !visited.has(nbKey)) {
                    visited.add(nbKey);
                    queue.push(neighbor);
                }
            }

            // WIN CONDITION: If this single connected group touches all 3 sides, the player wins
            if (sidesInGroup.size === 3) return true;
        }
    }

    return false; // No group connects all three sides
};


/**
 * Convierte el estado interno del tablero de React al formato string YEN
 * @param boardState - Diccionario de fichas puestas { "x-y-z": jugador }
 * @param size - Tamaño del tablero
 * @returns String en notación YEN (ej: "B/.B/R.B/...")
 */
export const boardToYen = (boardState: Record<string, number>, size: number): string => {
  const targetSum = size - 1;
  const rows: string[] = [];

  // Recorremos el tablero exactamente igual que en gridUtils.tsx
  // x es la fila (del pico x=size-1 a la base x=0)
  for (let x = targetSum; x >= 0; x--) {
    let rowStr = "";
    const rowLength = targetSum - x;
    
    // y recorre las celdas dentro de esa fila
    for (let y = 0; y <= rowLength; y++) {
      const z = targetSum - x - y;
      const key = `${x}-${y}-${z}`;
      const owner = boardState[key];
      
      if (owner === 1) rowStr += "B";      // Jugador 1 -> Blue
      else if (owner === 2) rowStr += "R"; // Jugador 2 -> Red
      else rowStr += ".";                  // Vacío
    }
    rows.push(rowStr);
  }

  // Unimos las filas con barras inclinadas
  return rows.join("/");
};