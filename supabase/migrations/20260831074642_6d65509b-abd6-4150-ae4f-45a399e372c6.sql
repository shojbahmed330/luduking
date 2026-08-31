CREATE OR REPLACE FUNCTION public.is_group_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'rajshahi.jibon@gmail.com'
$$;

-- Clean up permissive legacy policies
DROP POLICY IF EXISTS "Expenses are fully accessible" ON public.expenses;
DROP POLICY IF EXISTS "Matches are fully accessible" ON public.matches;
DROP POLICY IF EXISTS "Match results are fully accessible" ON public.match_results;
DROP POLICY IF EXISTS "Authenticated users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can update match_results" ON public.match_results;
DROP POLICY IF EXISTS "Authenticated users can delete match_results" ON public.match_results;

CREATE POLICY "Admin can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (public.is_group_admin()) WITH CHECK (public.is_group_admin());
CREATE POLICY "Admin can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (public.is_group_admin());
CREATE POLICY "Admin can update matches" ON public.matches FOR UPDATE TO authenticated USING (public.is_group_admin()) WITH CHECK (public.is_group_admin());
CREATE POLICY "Admin can delete matches" ON public.matches FOR DELETE TO authenticated USING (public.is_group_admin());
CREATE POLICY "Admin can update match_results" ON public.match_results FOR UPDATE TO authenticated USING (public.is_group_admin()) WITH CHECK (public.is_group_admin());
CREATE POLICY "Admin can delete match_results" ON public.match_results FOR DELETE TO authenticated USING (public.is_group_admin());

-- Player management
GRANT SELECT ON public.players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;

DROP POLICY IF EXISTS "Admin can insert players" ON public.players;
DROP POLICY IF EXISTS "Admin can update players" ON public.players;
DROP POLICY IF EXISTS "Admin can delete players" ON public.players;
CREATE POLICY "Admin can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (public.is_group_admin());
CREATE POLICY "Admin can update players" ON public.players FOR UPDATE TO authenticated USING (public.is_group_admin()) WITH CHECK (public.is_group_admin());
CREATE POLICY "Admin can delete players" ON public.players FOR DELETE TO authenticated USING (public.is_group_admin());