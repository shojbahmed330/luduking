# Mobile-First Professional UI Refinement Plan

Revising the "Ludu Hisab" app to enhance its professional feel and mobile usability through tactile feedback, refined spacing, and visual hierarchy.

## UI/UX Enhancements

1. **Refined Typography & Spacing**
   - Increase contrast between headings and body text.
   - Standardize padding across all cards and sections for a consistent "breathable" feel.
   - Use a more subtle background color (`#F8FAFC`) to make white cards pop.

2. **Tactile Feedback & Micro-interactions**
   - Add "active" states to all interactive elements (buttons, chips, tabs) using subtle scale-downs (98%) and background dimming.
   - Implement Haptic-like visual feedback: brief glow or color shift when a form is successfully submitted.

3. **Visual Hierarchy & Professional Polish**
   - Replace standard HTML shadows with "soft layered shadows" for a modern floating effect on cards.
   - Add subtle border-gradients or "glassmorphism" effects to the sticky header and bottom navigation bar.
   - Use a more sophisticated color palette: slightly desaturated "Ludu" colors for a more premium look.

4. **Mobile Navigation & Forms**
   - Implement "Bottom Sheets" for selection menus (like the month selector) instead of standard dropdowns.
   - Add multi-step progress indicators for the "Add Match" flow.
   - Optimize input fields for mobile: larger touch targets, auto-focus where appropriate, and specific keyboard types (numeric for Taka).

## Technical Details

- **Tailwind CSS**: Use custom shadow utilities and transition durations.
- **Framer Motion**: Add `whileTap={{ scale: 0.98 }}` to all interactive components.
- **Radix UI / Shadcn**: Integrate `Drawer` component for bottom sheets.
- **CSS Variables**: Refine `--background` and `--card` tokens in `src/styles.css`.

