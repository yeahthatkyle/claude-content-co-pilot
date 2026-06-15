CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL,
  stage text,
  persona text,
  product text,
  brief text,
  output text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.generations TO anon, authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read generations" ON public.generations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert generations" ON public.generations FOR INSERT WITH CHECK (true);