// src/utils/gameOfLife.ts
export class GameOfLife {
  private grid: boolean[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number, seed: number) {
    this.width = width;
    this.height = height;
    this.grid = this.initializeGrid(seed);
    console.log('Game of Life initialized with seed:', seed);
  }

  private initializeGrid(seed: number): boolean[][] {
    const grid = Array(this.height).fill(null)
      .map(() => Array(this.width).fill(false));
    
    // More reliable seeded random
    const random = this.seededRandom(seed);
    
    // Create a more interesting initial pattern
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Use different probability patterns
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        const threshold = 0.4 - (distanceFromCenter / (this.width + this.height));
        grid[y][x] = random() < Math.max(0.1, threshold);
      }
    }
    
    return grid;
  }

  private seededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = Math.sin(value) * 10000;
      return (value - Math.floor(value));
    };
  }

  public nextGeneration(): void {
    const newGrid = Array(this.height).fill(null)
      .map(() => Array(this.width).fill(false));
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const neighbors = this.countNeighbors(x, y);
        const isAlive = this.grid[y][x];
        
        if (isAlive && (neighbors === 2 || neighbors === 3)) {
          newGrid[y][x] = true;
        } else if (!isAlive && neighbors === 3) {
          newGrid[y][x] = true;
        }
      }
    }
    
    this.grid = newGrid;
  }

  private countNeighbors(x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const newX = (x + dx + this.width) % this.width;
        const newY = (y + dy + this.height) % this.height;
        
        if (this.grid[newY][newX]) count++;
      }
    }
    return count;
  }

  public getGrid(): boolean[][] {
    return this.grid.map(row => [...row]);
  }
}