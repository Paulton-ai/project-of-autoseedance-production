CREATE POLICY "Anyone can read voice previews"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'voice-previews');