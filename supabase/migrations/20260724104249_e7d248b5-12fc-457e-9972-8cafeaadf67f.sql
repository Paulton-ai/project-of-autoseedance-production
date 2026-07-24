CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.reel_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  topic TEXT NOT NULL,
  niche TEXT,
  video_length INT NOT NULL DEFAULT 30,
  style TEXT,
  aspect TEXT NOT NULL DEFAULT 'portrait',
  model TEXT,
  quality TEXT NOT NULL DEFAULT 'budget',
  voiceover BOOLEAN NOT NULL DEFAULT true,
  voice TEXT,
  music BOOLEAN NOT NULL DEFAULT false,
  music_mood TEXT,
  captions BOOLEAN NOT NULL DEFAULT true,
  caption_style TEXT,
  reference_image_url TEXT,
  script JSONB,
  scene_assets JSONB,
  voiceover_url TEXT,
  music_url TEXT,
  final_video_url TEXT,
  credits_used INT NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reel_generations TO authenticated;
GRANT ALL ON public.reel_generations TO service_role;

ALTER TABLE public.reel_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reels" ON public.reel_generations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all reels" ON public.reel_generations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS reel_generations_user_created_idx
  ON public.reel_generations (user_id, created_at DESC);

DROP TRIGGER IF EXISTS reel_generations_updated_at ON public.reel_generations;
CREATE TRIGGER reel_generations_updated_at
  BEFORE UPDATE ON public.reel_generations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();