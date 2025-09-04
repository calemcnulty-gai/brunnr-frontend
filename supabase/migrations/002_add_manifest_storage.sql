-- Add columns to projects table for manifest and API data
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS manifest JSONB,
ADD COLUMN IF NOT EXISTS api_responses JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS template_images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS shotgroups JSONB DEFAULT '[]';

-- Create storage buckets for images and manifests
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('images', 'images', false),
  ('manifests', 'manifests', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Storage policies for manifests bucket
CREATE POLICY "Users can upload own manifests" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'manifests' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can view own manifests" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'manifests' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can update own manifests" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'manifests' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can delete own manifests" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'manifests' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Add indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_projects_manifest ON projects USING gin(manifest);
CREATE INDEX IF NOT EXISTS idx_projects_api_responses ON projects USING gin(api_responses);
