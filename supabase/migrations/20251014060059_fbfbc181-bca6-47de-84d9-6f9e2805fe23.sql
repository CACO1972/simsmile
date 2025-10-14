-- Create storage bucket for smile analysis images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'smile-images',
  'smile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS policies for smile-images bucket
CREATE POLICY "Anyone can upload smile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'smile-images');

CREATE POLICY "Anyone can view smile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'smile-images');

CREATE POLICY "Anyone can update their smile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'smile-images');

-- Add ideal_image_url column to smile_analyses if not exists
ALTER TABLE public.smile_analyses 
ADD COLUMN IF NOT EXISTS ideal_image_url text;

-- Add analysis_text column to store the full analysis
ALTER TABLE public.smile_analyses 
ADD COLUMN IF NOT EXISTS analysis_text text;