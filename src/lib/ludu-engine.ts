/**
 * Ludu Engine Logic
 * Handles board mapping, piece movement, and game rules.
 */

export type LuduColor = 'red' | 'green' | 'blue' | 'yellow';

export interface Piece {
  id: string;
  color: LuduColor;
  position: number; // -1 = Home, 0-51 = Main Track, 52-57 = Final Path, 58 = Finished
  isSafe: boolean;
}

export interface PlayerData {
  id: string;
  name: string;
  color: LuduColor;
  pieces: Piece[];
}

export const BOARD_SIZE = 15; // 15x15 grid

// Safe spots on the 52-tile track
export const SAFE_SPOTS = [1, 9, 14, 22, 27, 35, 40, 48];

// Entry points for each color
export const ENTRY_POINTS: Record<LuduColor, number> = {
  red: 1,
  green: 14,
  yellow: 27,
  blue: 40
};

// Start of final path relative to entry point
export const FINAL_PATH_START = 51;

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function getNextPosition(currentPos: number, steps: number): number {
  if (currentPos === -1) return steps === 6 ? 0 : -1;
  
  const newPos = currentPos + steps;
  if (newPos > 57) return currentPos; // Must land exactly on 57 (finish)
  return newPos;
}

export function isWinning(pieces: Piece[]): boolean {
  return pieces.every(p => p.position === 58);
}
