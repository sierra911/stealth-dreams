
/**
 * A* Pathfinding algorithm implementation
 */

// Node object for pathfinding
interface Node {
  x: number;
  y: number;
  g: number; // Cost from start to current node
  h: number; // Heuristic (estimated cost from current to end)
  f: number; // Total cost (g + h)
  walkable: boolean;
  parent: Node | null;
}

// Create a grid of nodes
export const createGrid = (width: number, height: number, obstacles: {x: number, y: number}[]): Node[][] => {
  const grid: Node[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Node[] = [];
    for (let x = 0; x < width; x++) {
      // Check if this position has an obstacle
      const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
      
      row.push({
        x,
        y,
        g: 0,
        h: 0,
        f: 0,
        walkable: !isObstacle,
        parent: null
      });
    }
    grid.push(row);
  }
  
  return grid;
};

// Heuristic function (Manhattan distance)
const heuristic = (a: {x: number, y: number}, b: {x: number, y: number}): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Find neighbors of a node
const getNeighbors = (grid: Node[][], node: Node): Node[] => {
  const neighbors: Node[] = [];
  const { x, y } = node;
  
  // Check in all four directions (up, right, down, left)
  const dirs = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }  // left
  ];
  
  for (const dir of dirs) {
    const newX = x + dir.x;
    const newY = y + dir.y;
    
    // Skip if out of bounds
    if (newX < 0 || newX >= grid[0].length || newY < 0 || newY >= grid.length) {
      continue;
    }
    
    // Skip if not walkable
    if (!grid[newY][newX].walkable) {
      continue;
    }
    
    neighbors.push(grid[newY][newX]);
  }
  
  return neighbors;
};

// A* pathfinding algorithm
export const findPath = (
  grid: Node[][],
  startPos: {x: number, y: number},
  endPos: {x: number, y: number}
): {x: number, y: number}[] => {
  // Create start and end nodes
  const startNode = grid[startPos.y][startPos.x];
  const endNode = grid[endPos.y][endPos.x];
  
  // Initialize open and closed lists
  const openList: Node[] = [];
  const closedList: Node[] = [];
  
  // Add the start node to open list
  openList.push(startNode);
  
  // Loop until open list is empty
  while (openList.length > 0) {
    // Find the node with the lowest f value
    let currentNodeIndex = 0;
    for (let i = 0; i < openList.length; i++) {
      if (openList[i].f < openList[currentNodeIndex].f) {
        currentNodeIndex = i;
      }
    }
    const currentNode = openList[currentNodeIndex];
    
    // Remove current node from open list and add to closed list
    openList.splice(currentNodeIndex, 1);
    closedList.push(currentNode);
    
    // If reached the end node, reconstruct path
    if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
      const path: {x: number, y: number}[] = [];
      let current: Node | null = currentNode;
      
      while (current) {
        path.push({ x: current.x, y: current.y });
        current = current.parent;
      }
      
      // Return reversed path (from start to end)
      return path.reverse();
    }
    
    // Get all neighbors of current node
    const neighbors = getNeighbors(grid, currentNode);
    
    for (const neighbor of neighbors) {
      // Skip if neighbor is in closed list
      if (closedList.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
        continue;
      }
      
      // Calculate g score for this path
      const gScore = currentNode.g + 1; // Assuming cost of 1 for each step
      
      // Check if neighbor is in open list
      const inOpenList = openList.some(node => node.x === neighbor.x && node.y === neighbor.y);
      
      if (!inOpenList || gScore < neighbor.g) {
        // Update neighbor values
        neighbor.g = gScore;
        neighbor.h = heuristic(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = currentNode;
        
        // Add to open list if not already there
        if (!inOpenList) {
          openList.push(neighbor);
        }
      }
    }
  }
  
  // No path found
  return [];
};
