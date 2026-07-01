
CREATE POLICY "Anyone can view review media" ON storage.objects FOR SELECT USING (bucket_id = 'review-media');
CREATE POLICY "Users can upload their own review media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own review media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'review-media' AND auth.uid()::text = (storage.foldername(name))[1]);
