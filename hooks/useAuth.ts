import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, Post, Event } from '@/lib/supabase';
import { apiClient } from '@/lib/api';

interface ActivityItem {
  id: string;
  type: 'post' | 'event';
  title: string;
  imageUrl: string;
  location?: string;
  date: string;
  likes?: number;
  comments?: number;
  attendees?: number;
  timestamp: string;
  rawDate: Date;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  activities: ActivityItem[];
  activitiesLoading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loadActivities: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const creatingProfile = useRef(false);
  const activitiesLoaded = useRef(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      // Add a small delay to ensure session is properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if we have a valid session first
      const isAuth = await apiClient.isAuthenticated();
      if (isAuth) {
        try {
          const profileData = await apiClient.getProfile();
          setProfile(profileData);
        } catch (profileError: any) {
          console.log('Profile not found, attempting to create one:', profileError.message);
          
          // Check if it's a 404 error or 400 with empty detail (profile not found) and only then create profile
          if (profileError.message.includes('404') || 
              profileError.message.includes('Profile not found') ||
              (profileError.message.includes('400') && profileError.message.includes('{"detail":""}'))  ) {
            
            // Prevent concurrent profile creation attempts
            if (creatingProfile.current) {
              console.log('Profile creation already in progress, skipping...');
              setProfile(null);
              return;
            }
            
            try {
              creatingProfile.current = true;
              console.log('Creating new profile for user...');
              
              // Get current user data from session
              const { data: { session } } = await supabase.auth.getSession();
              const currentUser = session?.user;
              
              if (!currentUser) {
                throw new Error('No user session found');
              }
              
              // Use email as username and get full_name from user metadata
              const email = currentUser.email || '';
              const username = email.split('@')[0] || `user_${Date.now()}`;
              const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '';
              
              const newProfile = await apiClient.createProfile({
                username: username,
                full_name: fullName,
                bio: '',
                avatar_url: currentUser.user_metadata?.avatar_url || '',
                location: '',
                travel_style: '',
                interests: []
              });
              setProfile(newProfile.profile);
              console.log('Profile created successfully');
            } catch (createError: any) {
              console.error('Failed to create profile:', createError.message);
              
              // If profile already exists, try to fetch it with a delay
              if (createError.message.includes('already exists') || createError.message.includes('23505') || createError.message.includes('Profile already exists')) {
                console.log('Profile already exists, attempting to fetch it after delay...');
                try {
                  // Wait a bit and try again - sometimes there's a delay in DB consistency
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  const existingProfile = await apiClient.getProfile();
                  setProfile(existingProfile);
                  console.log('Successfully fetched existing profile');
                } catch (fetchError: any) {
                  console.error('Failed to fetch existing profile:', fetchError);
                  // If we still can't fetch, it might be because the profile trigger is creating it
                  // Try one more time with a longer delay
                  try {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const existingProfile = await apiClient.getProfile();
                    setProfile(existingProfile);
                    console.log('Successfully fetched existing profile after retry');
                  } catch (finalError) {
                    console.error('Final attempt to fetch profile failed:', finalError);
                    setProfile(null);
                  }
                }
              } else {
                setProfile(null);
              }
            } finally {
              creatingProfile.current = false;
            }
          } else {
            // For other errors (like 400 - profile already exists), just log and continue
            console.log('Profile error (not creating):', profileError.message);
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.log('Error in loadProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedProfile = await apiClient.updateProfile(updates);
    setProfile(updatedProfile);
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = await apiClient.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const loadActivities = async () => {
    // Only load if not already loaded or if forced
    if (activitiesLoaded.current && activities.length > 0) {
      return;
    }

    setActivitiesLoading(true);
    try {
      const [postsResult, eventsResult] = await Promise.all([
        apiClient.safeRequest<{ posts: Post[] }>('/api/posts?limit=10'),
        apiClient.safeRequest<{ events: Event[] }>('/api/events')
      ]);

      const newActivities: ActivityItem[] = [];

      // Add posts
      if (postsResult?.posts) {
        postsResult.posts.forEach(post => {
          newActivities.push({
            id: `post-${post.id}`,
            type: 'post',
            title: post.content,
            imageUrl: post.image_url || 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=300',
            likes: post.likes_count,
            comments: 0, // Add comments count if available
            timestamp: new Date(post.created_at).toLocaleDateString(),
            rawDate: new Date(post.created_at),
            date: new Date(post.created_at).toLocaleDateString()
          });
        });
      }

      // Add events
      if (eventsResult?.events) {
        eventsResult.events.forEach(event => {
          newActivities.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            imageUrl: event.image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
            location: event.location,
            attendees: event.attendees_count,
            date: new Date(event.event_date).toLocaleDateString(),
            timestamp: new Date(event.created_at).toLocaleDateString(),
            rawDate: new Date(event.created_at)
          });
        });
      }

      // Sort by date (most recent first)
      newActivities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setActivities(newActivities);
      activitiesLoaded.current = true;
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const refreshActivities = async () => {
    // Force reload activities
    activitiesLoaded.current = false;
    await loadActivities();
  };

  return {
    user,
    profile,
    session,
    loading,
    activities,
    activitiesLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    loadActivities,
    refreshActivities,
  };
}

export { AuthContext };