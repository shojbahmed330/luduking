# Plan: Professional UI/UX Refinement for Ludu Hisab

Enhance the mobile-first experience to feel like a high-end native application through visual consistency, improved interactions, and refined layouts.

## User Review Required

> [!IMPORTANT]
> The current "Overview" tab has a lot of secondary links. Should we move the "Add Match" and "Add Expense" buttons to a more prominent floating action button or keep them as large cards within the tab?

- **Color Palette Consistency**: Standardize the use of semantic colors across all screens to ensure a cohesive brand identity.
- **Micro-interactions**: Implement subtle animations and feedback loops for all user actions.

## Proposed Changes

### Styling & Visual Polish
- **Refined Surfaces**: Update `src/styles.css` with a multi-layered shadow system and sophisticated background gradients for cards.
- **Glassmorphism**: Enhance the `glass-header` and `glass-nav` with better blur radius and subtle borders to improve depth.
- **Typography**: Standardize tracking and font weights for a more "designed" editorial feel.

### Component Enhancements
- **StatCard 2.0**: Update `StatCard.tsx` with internal padding refinements and a subtle inner glow effect for colored variants.
- **PlayerAvatar**: Add a delicate ring or shadow to avatars to make them pop against various backgrounds.
- **List Items**: Redesign match and expense list items in `src/routes/history.tsx` and `src/routes/index.tsx` (Matches tab) with better information hierarchy.

### Layout Optimization
- **Dashboard Tabs**: Refine the tab bar in `src/routes/index.tsx` with a sliding background indicator for the active state.
- **Money Tab**: Convert the remaining tables in the Money tab into card-based layouts for better mobile viewing.
- **Matches Tab**: Improve the match detail cards to show a "Match Breakdown" that is easier to scan.

## Technical Details
- Utilize `framer-motion` for layout transitions and shared element animations.
- Leverage Tailwind's `group` and `peer` utilities for complex hover/active states.
- Ensure all touch targets meet the 44px minimum with proper visual hit states.
