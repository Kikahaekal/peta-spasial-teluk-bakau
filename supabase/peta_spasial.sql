CREATE TABLE IF NOT EXISTS public.peta_spasial (
  filename uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geojson jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.peta_spasial
  ALTER COLUMN filename SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.peta_spasial TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.peta_spasial TO authenticated;

DROP POLICY IF EXISTS "Public can read peta_spasial" ON public.peta_spasial;
CREATE POLICY "Public can read peta_spasial"
  ON public.peta_spasial
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert peta_spasial" ON public.peta_spasial;
CREATE POLICY "Admins can insert peta_spasial"
  ON public.peta_spasial
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update peta_spasial" ON public.peta_spasial;
CREATE POLICY "Admins can update peta_spasial"
  ON public.peta_spasial
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete peta_spasial" ON public.peta_spasial;
CREATE POLICY "Admins can delete peta_spasial"
  ON public.peta_spasial
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
