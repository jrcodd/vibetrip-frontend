-- Add organizer_username field to events table
ALTER TABLE events ADD COLUMN organizer_username text;

-- Update existing events to populate organizer_username from profiles table
UPDATE events 
SET organizer_username = profiles.username 
FROM profiles 
WHERE events.organizer_id = profiles.id;

-- Make organizer_username NOT NULL after population
ALTER TABLE events ALTER COLUMN organizer_username SET NOT NULL;

-- Create index for better performance
CREATE INDEX idx_events_organizer_username ON events(organizer_username);