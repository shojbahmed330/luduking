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
  isBot?: boolean;
}

export const BOARD_SIZE = 15;

// Safe spots on the 52-tile track
export const SAFE_SPOTS = [1, 9, 14, 22, 27, 35, 40, 48];

// Entry points for each color on the 52-tile track
export const ENTRY_POINTS: Record<LuduColor, number> = {
  red: 1,
  green: 14,
  yellow: 27,
  blue: 40
};

// Colors order for turn management
export const COLOR_ORDER: LuduColor[] = ['red', 'green', 'yellow', 'blue'];

/**
 * Maps a relative position (0-57) to absolute track coordinates
 * @param color The piece color
 * @param relativePos Position from 0 (start) to 57 (finish)
 * @returns Track index (0-51) or special identifier for home/final path
 */
export function getAbsoluteTrackPos(color: LuduColor, relativePos: number): number | string {
  if (relativePos < 0) return 'home';
  if (relativePos > 51) return `final-${color}-${relativePos - 52}`;
  
  const startOffset = ENTRY_POINTS[color];
  return (startOffset + relativePos) % 52;
}

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

/**
 * Simplified board coordinate mapping for the 15x15 grid
 */
export function getCoordinates(color: LuduColor, position: number, pieceIdx: number): { x: number, y: number } {
  // Home Base Coordinates
  if (position === -1) {
    const bases = {
      red: { x: 1.5, y: 1.5 },
      green: { x: 10.5, y: 1.5 },
      yellow: { x: 10.5, y: 10.5 },
      blue: { x: 1.5, y: 10.5 }
    };
    const base = bases[color];
    const offsets = [
      { dx: 0, dy: 0 }, { dx: 2, dy: 0 },
      { dx: 0, dy: 2 }, { dx: 2, dy: 2 }
    ];
    return { x: base.x + offsets[pieceIdx].dx, y: base.y + offsets[pieceIdx].dy };
  }

  // Finish Area
  if (position === 58) {
    return { x: 7, y: 7 };
  }

  // Final Path (6 steps)
  if (position >= 52) {
    const step = position - 52;
    if (color === 'red') return { x: 1 + step, y: 7 };
    if (color === 'green') return { x: 7, y: 1 + step };
    if (color === 'yellow') return { x: 13 - step, y: 7 };
    if (color === 'blue') return { x: 7, y: 13 - step };
  }

  // Main Track mapping (simplified sequence)
  // This is a rough mapping of the Ludu track logic
  const absPos = (ENTRY_POINTS[color] + position) % 52;
  
  // Track mapping for a 15x15 board
  // 0-5: top-middle column 6 (going down)
  // 6-11: top-right row 6 (going right)
  // etc...
  
  // For brevity in this implementation, we use a pre-calculated track array
  // normally this would be a full coordinate map of the 52 tiles
  const trackMap = [
    {x:6,y:13},{x:6,y:12},{x:6,y:11},{x:6,y:10},{x:6,y:9},
    {x:5,y:8},{x:4,y:8},{x:3,y:8},{x:2,y:8},{x:1,y:8},{x:0,y:8},
    {x:0,y:7},{x:0,y:6},{x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},
    {x:6,y:5},{x:6,y:4},{x:6,y:3},{x:6,y:2},{x:6,y:1},{x:6,y:0},
    {x:7,y:0},{x:8,y:0},{x:8,y:1},{x:8,y:2},{x:8,y:3},{x:8,y:4},{x:8,y:5},
    {x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:13,y:6},{x:14,y:6},
    {x:14,y:7},{x:14,y:8},{x:13,y:8},{x:12,y:8},{x:11,y:8},{x:10,y:8},{x:9,y:8},
    {x:8,y:9},{x:8,y:10},{x:8,y:11},{x:8,y:12},{x:8,y:13},{x:8,y:14},
    {x:7,y:14},{x:6,y:14}
  ];

  return trackMap[absPos] || { x: 7, y: 7 };
}

