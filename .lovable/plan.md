# Ludu Hisab — UI Improvement Plan

The ranking rule is already changed to 30% participation. Below are the proposed UI upgrades — pick the ones you want.

## 1. Home / Overview
- Month switcher as a swipeable pill row (prev / current / next) right under the header, instead of a dropdown.
- "This Month at a glance" strip: matches played, current leader, days left in month.
- Count-up animation on Fund and stat numbers when a month changes.

## 2. Tabs and navigation
- Sticky tab bar (Overview, Matches, Money, Due, Insights, Ranking) that stays visible while scrolling, with icons.
- Swipe left/right between tabs on mobile.
- Bigger center "+" button in the bottom bar opening a sheet: Add Match, Add Expense, Add Payment.

## 3. Player Ranking
- Top-3 podium card (gold / silver / bronze) with avatars above the list.
- Progress bar for players not yet eligible: "4 / 6 matches to qualify".
- Collapsible "How it's calculated" box so it doesn't take space.

## 4. Due & Payment
- Colored status per player: Due (red), Clear (green), Advance (blue) with a single summary bar.
- Tap a player to expand their ledger instead of showing everything at once.

## 5. Matches / History
- Group matches by day with date headers ("Today", "Yesterday", "12 Oct").
- Compact match card: winner avatar large, others small with position colors.
- Filter chips: by player, by position.

## 6. Head to Head / Insights
- Side-by-side player cards with avatars, a "VS" badge, and win bars.
- Chart cards with a small legend and empty-state illustration when a month has no data.

## 7. General polish
- Consistent empty states with the Ludu King crest ("No matches yet this month").
- Player profile page: tap any name to see that player's month stats.
- Unified spacing and card sizes across all pages.

## Suggested order
1. Ranking podium + progress bars (3)
2. Sticky tabs + center "+" button (2)
3. Due status colors + expandable ledger (4)
4. History grouping (5), then the rest

## Technical notes
- Frontend-only changes in src/routes/index.tsx, history.tsx, BottomNavBar, plus small new components under src/components/ludu.
- No database changes; existing design tokens reused.
