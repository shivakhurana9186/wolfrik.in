
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_handle TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_handle_idx ON public.reviews(product_handle, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
