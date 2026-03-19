
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