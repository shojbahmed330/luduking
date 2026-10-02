ALTER TABLE public.match_results DROP CONSTRAINT IF EXISTS match_results_player_id_fkey;
ALTER TABLE public.match_results ADD CONSTRAINT match_results_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;
ALTER TABLE public.match_results DROP CONSTRAINT IF EXISTS match_results_match_id_fkey;
ALTER TABLE public.match_results ADD CONSTRAINT match_results_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_player_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;