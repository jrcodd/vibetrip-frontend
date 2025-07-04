/*
  # VibeTrip Database Schema

  1. New Tables
    - `profiles` - User profile information extending Supabase auth.users
    - `posts` - User posts with travel content
    - `places` - Travel destinations and locations
    - `events` - Travel events and activities
    - `badges` - Achievement badges
    - `user_badges` - User earned badges
    - `connections` - User connections/following
    - `post_likes` - Post likes tracking
    - `post_saves` - Saved posts
    - `event_rsvps` - Event RSVP tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS post_saves CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  bio text,
  avatar_url text,
  location text,
  travel_style text,
  interests text[],
  places_visited integer DEFAULT 0,
  events_attended integer DEFAULT 0,
  badges_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Places table
CREATE TABLE places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  location text NOT NULL,
  latitude decimal,
  longitude decimal,
  image_url text,
  rating decimal DEFAULT 0,
  is_hidden boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  image_url text,
  place_id uuid,
  post_type text DEFAULT 'story' CHECK (post_type IN ('story', 'recommendation', 'event', 'challenge')),
  likes_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  price text,
  max_attendees integer,
  attendees_count integer DEFAULT 0,
  organizer_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Badges table
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  requirements jsonb,
  created_at timestamptz DEFAULT now()
);

-- User badges junction table
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  badge_id uuid,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Connections table (following/followers)
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid,
  following_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Post likes table
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Post saves table
CREATE TABLE post_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Event RSVPs table
CREATE TABLE event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_id uuid,
  status text DEFAULT 'interested' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Add foreign key constraints after all tables are created
ALTER TABLE places ADD CONSTRAINT fk_places_created_by 
  FOREIGN KEY (created_by) REFERENCES profiles(id);

ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE posts ADD CONSTRAINT fk_posts_place_id 
  FOREIGN KEY (place_id) REFERENCES places(id);

ALTER TABLE events ADD CONSTRAINT fk_events_organizer_id 
  FOREIGN KEY (organizer_id) REFERENCES profiles(id);

ALTER TABLE user_badges ADD CONSTRAINT fk_user_badges_user_id 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_badges ADD CONSTRAINT fk_user_badges_badge_id 
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;

ALTER TABLE connections ADD CONSTRAINT fk_connections_follower_id 
  FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE connections ADD CONSTRAINT fk_connections_following_id 
  FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE post_likes ADD CONSTRAINT fk_post_likes_user_id 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE post_likes ADD CONSTRAINT fk_post_likes_post_id 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE post_saves ADD CONSTRAINT fk_post_saves_user_id 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE post_saves ADD CONSTRAINT fk_post_saves_post_id 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE event_rsvps ADD CONSTRAINT fk_event_rsvps_user_id 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_rsvps ADD CONSTRAINT fk_event_rsvps_event_id 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Places policies
CREATE POLICY "Users can view all places"
  ON places FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create places"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Events policies
CREATE POLICY "Users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Badges policies
CREATE POLICY "Users can view all badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User badges policies
CREATE POLICY "Users can view all user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can earn badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view all connections"
  ON connections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Post likes policies
CREATE POLICY "Users can view all post likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post saves policies
CREATE POLICY "Users can view own saved posts"
  ON post_saves FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON post_saves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON post_saves FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Event RSVPs policies
CREATE POLICY "Users can view all event RSVPs"
  ON event_rsvps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can RSVP to events"
  ON event_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs"
  ON event_rsvps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions and triggers for updating counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET saves_count = saves_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
    UPDATE events SET attendees_count = attendees_count + 1 WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'going' AND NEW.status = 'going' THEN
      UPDATE events SET attendees_count = attendees_count + 1 WHERE id = NEW.event_id;
    ELSIF OLD.status = 'going' AND NEW.status != 'going' THEN
      UPDATE events SET attendees_count = attendees_count - 1 WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
    UPDATE events SET attendees_count = attendees_count - 1 WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER post_saves_count_trigger
  AFTER INSERT OR DELETE ON post_saves
  FOR EACH ROW EXECUTE FUNCTION update_post_saves_count();

CREATE TRIGGER event_attendees_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_event_attendees_count();

-- Insert sample badges
INSERT INTO badges (name, description, icon, category, requirements) VALUES
('City Explorer', 'Visited 10 different cities', '🏙️', 'exploration', '{"cities_visited": 10}'),
('Foodie Master', 'Tried 50 local restaurants', '🍕', 'food', '{"restaurants_visited": 50}'),
('Adventure Seeker', 'Completed 5 adventure activities', '⛰️', 'adventure', '{"adventure_activities": 5}'),
('Social Butterfly', 'Connected with 100 travelers', '🦋', 'social', '{"connections": 100}'),
('Photo Pro', 'Shared 25 travel photos', '📸', 'photography', '{"photos_shared": 25}'),
('Event Host', 'Organized 3 travel events', '🎉', 'events', '{"events_organized": 3}'),
('Hidden Gem Hunter', 'Discovered 15 hidden locations', '💎', 'exploration', '{"hidden_gems": 15}'),
('Cultural Immersion', 'Attended 10 cultural events', '🏛️', 'culture', '{"cultural_events": 10}');