
-- Extend queue_jobs for the production generation pipeline
ALTER TABLE public.queue_jobs
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'text2video',
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS media_urls text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS ingredients jsonb,
  ADD COLUMN IF NOT EXISTS output_url text,
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS queue_jobs_user_status_idx
  ON public.queue_jobs (user_id, status, position);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('results', 'results', true)
ON CONFLICT (id) DO NOTHING;

-- Uploads bucket: user folder = auth.uid()
CREATE POLICY "uploads_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "uploads_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "uploads_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "uploads_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Results bucket: public read, user-owned write
CREATE POLICY "results_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'results');

CREATE POLICY "results_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "results_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "results_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'results' AND auth.uid()::text = (storage.foldername(name))[1]);
