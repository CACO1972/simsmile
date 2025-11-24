-- Add user_id column to link analyses to authenticated users
ALTER TABLE smile_analyses 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX idx_smile_analyses_user_id ON smile_analyses(user_id);

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can read their own analysis" ON smile_analyses;
DROP POLICY IF EXISTS "Anyone can update their analysis" ON smile_analyses;
DROP POLICY IF EXISTS "Anyone can create analysis" ON smile_analyses;

-- Create secure user-scoped policies
CREATE POLICY "Users can read own analyses" 
ON smile_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" 
ON smile_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" 
ON smile_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" 
ON smile_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Make storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE name = 'smile-images';

-- Add RLS policy for storage (user-scoped access)
CREATE POLICY "Users can access their own smile images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'smile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own smile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'smile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own smile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'smile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own smile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'smile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);