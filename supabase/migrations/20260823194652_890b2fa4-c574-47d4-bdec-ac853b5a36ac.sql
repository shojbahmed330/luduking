-- Add created_by and updated_by columns to matches and expenses
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS created_by_name text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS updated_by_name text;

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS created_by_name text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS updated_by_name text;

-- Since the user wants a "Login" system with Google, we should ensure the tables have a way to track the auth user ID too for security
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update RLS policies to allow authenticated users
-- Drop existing broad anon policies if they exist (or update them)
-- For now, we'll keep it simple: anyone authenticated can read and write, but we log who did it.

CREATE POLICY "Authenticated users can select matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update matches" ON public.matches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete matches" ON public.matches FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (true);

-- Ensure match_results also accessible
CREATE POLICY "Authenticated users can select match_results" ON public.match_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert match_results" ON public.match_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update match_results" ON public.match_results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete match_results" ON public.match_results FOR DELETE TO authenticated USING (true);

-- Grant permissions (standard procedure)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_results TO authenticated;
GRANT SELECT ON public.players TO authenticated;
