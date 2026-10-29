# Ludu Fund Tracker

STEP 1 — Project Setup & Database Schema

Paste this into Lovable FIRST, before any other step.

PROMPT

Build a mobile-first web app called "Ludu Hisab" — a shared score & expense tracker for a group of 6 friends who play Ludu regularly and also share daily tea/snack ("cha-nasta") expenses from a common fund.

This is the FIRST step of a multi-step build. In this step, ONLY set up the project foundation and database. Do not build any UI pages yet beyond a simple placeholder home screen that says "Ludu Hisab — Setup Complete".

1. Enable a cloud database (Supabase) for this project.

There is NO login or authentication in this app. It is a single shared app used by all 6 friends from their own phones, all reading and writing to the same shared data. Do not add any auth system, sign-up, or login screen.

2. Create the following database tables exactly as specified:

Table: players

Column Type Notes id uuid (primary key, default random) name text, not null, unique created_at timestamp, default now()

Seed this table with exactly these 6 rows on setup (in this order):

Shojib

Forid

Mahfuz

Mony

Kazol

Shamim

Table: matches

Column Type Notes id uuid (primary key, default random) match_date date, not null the date the Ludu match was played created_at timestamp, default now()

Table: match_results

Column Type Notes id uuid (primary key, default random) match_id uuid, foreign key → matches.id, not null on delete cascade player_id uuid, foreign key → players.id, not null position integer, not null finishing position in that match: 1, 2, 3, 4, 5, or 6 fine_amount integer, not null, default 0 computed value: if position = 3 then 5, if position = 4 then 10, else 0

Business rule to remember for later steps: a match can have anywhere from 3 to 6 participating players (never fewer than 3). Only position 3 gets a 5 Taka fine and position 4 gets a 10 Taka fine. Positions 1, 2, 5, and 6 never have a fine. There are no ties — every participant in a match has a unique position number.

Table: expenses

Column Type Notes id uuid (primary key, default random) expense_date date, not null the day the cha-nasta expense happened amount integer, not null amount spent in Taka note text, nullable optional short note, e.g. "biscuits and tea" created_at timestamp, default now()

3. Core financial logic to keep in mind for all later steps (do not build the UI for this yet, just understand the model):

Total Fund Collected = sum of all fine_amount values across all match_results rows.

Total Cha-Nasta Expense = sum of all amount values across all expenses rows.

Current Fund Balance = Total Fund Collected − Total Cha-Nasta Expense.

There is no separate "withdraw" step — entering an expense directly reduces the fund balance.

4. Placeholder home screen

For this step only, show a simple centered page with the app name "Ludu Hisab" and the subtitle "Setup Complete — Database Ready", plus a small dice emoji 🎲. This will be replaced with the real navigation/home screen in a later step.

5. Do NOT build yet (comes in later steps):

Match entry form

Expense entry form

Dashboard/stats page

History page

Final navigation and theme

Confirm the database tables and seed data are created correctly before moving to the next step.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://luduking.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7b669899-b6c4-4bbd-bde3-300af79db27b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
