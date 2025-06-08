-- Create a storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true);

-- Set up RLS policies for the event-images bucket
CREATE POLICY "Allow authenticated users to upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Allow public read access to event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

CREATE POLICY "Allow users to delete their own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');