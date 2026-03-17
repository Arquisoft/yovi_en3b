
import type { Cell } from "c:/Users/ELENA/OneDrive/Escritorio/asw/yovi_en3b/webapp/src/components/GameScreen/gridUtils";
export const checkWin = (boardState: Record<string, number>, player: number, size: number, allCells: Cell[]) => {
    // 1. Get all cells belonging to the current player
    const playerCells = allCells.filter(c => boardState[`${c.x}-${c.y}-${c.z}`] === player);
    
    // Safety check: a 'Y' shape needs a minimum number of pieces to actually connect
    if (playerCells.length < size) return false;

    const visited = new Set<string>();
    const dirs = [
        {x:1, y:-1, z:0}, {x:1, y:0, z:-1}, {x:0, y:1, z:-1},
        {x:-1, y:1, z:0}, {x:-1, y:0, z:1}, {x:0, y:-1, z:1}
    ];

    // Helper to determine which of the 3 main triangle sides a cell is touching
    const getEdgesTouched = (c: {x: number, y: number, z: number}, s: number) => {
        const edges = new Set<string>();
        // Side 1: The bottom edge (where Z is maximum)
        if (c.z === s - 1) edges.add('bottom');
        // Side 2: The left slanted edge (where X is 0)
        if (c.x === 0) edges.add('left');
        // Side 3: The right slanted edge (where Y is 0)
        if (c.y === 0) edges.add('right');
        return edges;
    };

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
            
            // Identify if this specific cell in the group touches a border
            const touched = getEdgesTouched(curr, size);
            touched.forEach(edge => sidesInGroup.add(edge));

            // WIN CONDITION: If this single connected group touches all 3 sides, the player wins
            if (sidesInGroup.size === 3) return true;

            // Check neighbors to expand the connected group
            for (const d of dirs) {
                const nx = curr.x + d.x;
                const ny = curr.y + d.y;
                const nz = curr.z + d.z;
                const nbKey = `${nx}-${ny}-${nz}`;

                // Only add to group if the neighbor is the same color and not visited
                if (boardState[nbKey] === player && !visited.has(nbKey)) {
                    visited.add(nbKey);
                    // Find the neighbor cell data to keep the BFS going
                    const neighbor = playerCells.find(pc => pc.x === nx && pc.y === ny && pc.z === nz);
                    if (neighbor) queue.push(neighbor);
                }
            }
        }
    }

    return false; // No group connects all three sides
};