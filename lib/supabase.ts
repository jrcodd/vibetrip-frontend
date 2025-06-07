import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  travel_style?: string;
  interests?: string[];
  places_visited: number;
  events_attended: number;
  badges_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  place_id?: string;
  post_type: 'story' | 'recommendation' | 'event' | 'challenge';
  likes_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  places?: Place;
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  rating: number;
  is_hidden: boolean;
  created_by?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  event_date: string;
  location: string;
  category: string;
  price?: string;
  max_attendees?: number;
  attendees_count: number;
  organizer_id?: string;
  created_at: string;
  profiles?: Profile;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: any;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface EventRSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
  updated_at: string;
}