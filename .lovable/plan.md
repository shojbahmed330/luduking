# Plan: Virtual Ludu Game Integration

Integrating a fully functional, multiplayer virtual Ludu game (similar to Ludu King) into the application.

## User Review Required

> [!IMPORTANT]
> A full "Ludu King" clone with physics, 3D animations, and complex multiplayer logic is a massive undertaking. I will implement a high-quality, 2D multiplayer-ready Ludu board engine using React and Tailwind, featuring dice rolls, piece movement, and game state sync via Lovable Cloud (Realtime).

- **Game Name**: Virtual Ludu
- **Style**: Classic Ludu King aesthetic (Colorful board, animated pieces).
- **Multiplayer**: Invite-based system using shareable links/room codes.

## Proposed Changes

### 1. Database & Realtime Setup
- Create `game_rooms` table: `id`, `created_by`, `status` (waiting/playing/finished), `current_turn_index`, `players_data` (JSONB for positions).
- Enable Supabase Realtime for `game_rooms` to ensure instant updates across all connected players.

### 2. Game Engine Development (`src/lib/ludu-engine.ts`)
- Logic for board mapping (safe zones, home path, finishing line).
- Piece movement rules (dice 6 for entry, kicking opponents, blockades).
- Turn management and win conditions.

### 3. Game Components (`src/components/game/`)
- `LuduBoard.tsx`: The visual rendering of the board and pieces.
- `Dice.tsx`: Animated dice rolling component.
- `GameUI.tsx`: Player indicators, chat, and status messages.

### 4. Integration
- Add a "Games" tab to the `BottomNavBar` with a game controller icon.
- Create `src/routes/games/index.tsx`: Lobby to join or create rooms.
- Create `src/routes/games/$roomId.tsx`: The actual game arena.

## Technical Details

- **Rendering**: SVG/CSS for the board to ensure responsiveness on all mobile screens.
- **State Management**: React state synced with Supabase Realtime `broadcast` channel for low-latency piece movement.
- **Animations**: `framer-motion` for smooth piece gliding and dice shakes.
