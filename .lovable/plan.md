# Plan: Step 2 — Design System & Ludu-Themed Visual Style

Implement a ludu-themed design system with custom colors, typography, and reusable components.

## User Review Required

> [!IMPORTANT]
> I will be using Google Fonts (Baloo 2) for the playful rounded look.

## Proposed Changes

### Design System & Styling
- Update `src/styles.css` with custom theme tokens:
  - Add Ludu colors (Gold, Green, Blue, Red) as semantic tokens.
  - Set off-white background and high-contrast text.
  - Configure large border-radii for the "game-like" feel.
- Update `src/routes/__root.tsx` to include Google Fonts (Baloo 2).

### Reusable UI Components
- Create `src/components/ludu/StatCard.tsx`: Rounded card for metrics.
- Create `src/components/ludu/PositionBadge.tsx`: Colorful badges for match rankings.
- Create `src/components/ludu/PlayerAvatar.tsx`: Circular avatars with initials.
- Create `src/components/ludu/PrimaryButton.tsx`: Full-width rounded buttons.
- Create `src/components/layout/BottomNavBar.tsx`: Mobile-fixed navigation shell.

### Layout & Shell
- Update `src/routes/__root.tsx` to include a global shell with the `BottomNavBar` and a header with the "Ludu Hisab 🎲" logo.
- Update `src/routes/index.tsx` to match the new visual style.

## Technical Details
- **Colors**:
  - `pos-1` (Gold): #F5B301
  - `pos-2` (Green): #2E9E4D
  - `pos-3` (Blue): #2D6CDF
  - `pos-4` (Red): #E14545
- **Typography**: `Baloo 2` via Google Fonts.
- **Framework**: Tailwind CSS v4 for all styling.
