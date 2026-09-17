DROP POLICY IF EXISTS "Admin can insert players" ON public.players;
CREATE POLICY "Authenticated users can insert players"
ON public.players FOR INSERT TO authenticated WITH CHECK (true);
GRANT SELECT, INSERT ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;