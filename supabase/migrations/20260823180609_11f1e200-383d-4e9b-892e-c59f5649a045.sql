CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO anon, authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches are fully accessible" ON public.matches FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id),
  position integer NOT NULL CHECK (position BETWEEN 1 AND 6),
  fine_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_id),
  UNIQUE (match_id, position)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_results TO anon, authenticated;
GRANT ALL ON public.match_results TO service_role;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Match results are fully accessible" ON public.match_results FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_fine_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.fine_amount := CASE NEW.position WHEN 3 THEN 5 WHEN 4 THEN 10 ELSE 0 END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER match_results_set_fine
BEFORE INSERT OR UPDATE ON public.match_results
FOR EACH ROW EXECUTE FUNCTION public.set_fine_amount();

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL,
  amount integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon, authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expenses are fully accessible" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.players (name) VALUES
  ('Shojib'), ('Forid'), ('Mahfuz'), ('Mony'), ('Kazol'), ('Shamim');