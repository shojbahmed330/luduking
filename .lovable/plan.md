# Plan - Step 4: Add Expense Feature

Implement the "Add Expense" feature for Ludu Hisab to log tea/snack expenses paid from the shared fund.

## User Interface
- Create `src/routes/add-expense.tsx`.
- Update `src/components/layout/BottomNavBar.tsx` to link to `/add-expense`.
- Add "Add Expense" button to the Home screen (`src/routes/index.tsx`).

## Technical Details
- **Form Fields**:
  - `date`: Date picker (default today).
  - `amount`: Numeric input (positive whole number, required).
  - `note`: Text area (optional).
- **Live Fund Preview**:
  - Implement a server function or client-side calculation to fetch the current fund balance.
  - Show "Current Fund Balance" and "After this expense" live.
  - Display a warning if the balance goes negative.
- **Database Logic**:
  - Use Supabase to insert a row into the `expenses` table.
- **Validation**:
  - Ensure amount is a positive integer.
- **Success Flow**:
  - Show success toast and redirect to Home (`/`).

## Calculation Model
- `Total Fund Collected` = SUM(`fine_amount` from `match_results`).
- `Total Expenses` = SUM(`amount` from `expenses`).
- `Current Balance` = `Total Fund Collected` - `Total Expenses`.
