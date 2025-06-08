import { supabase } from './supabase';
import type { Profile, Post, Place, Event, Badge, UserBadge, Connection } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('UNAUTHENTICATED');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.message === 'UNAUTHENTICATED') {
        // Handle unauthenticated state - redirect to login
        throw new Error('Please log in to continue');
      }
      throw error;
    }
  }

  // Add a method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.access_token;
    } catch {
      return false;
    }
  }

  // Add a method for safe API calls that handle auth errors
  async safeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error: any) {
      console.log('API request failed:', error.message);
      return null;
    }
  }

  // Profile methods
  async createProfile(profile: Omit<Profile, 'id' | 'places_visited' | 'events_attended' | 'badges_earned' | 'created_at' | 'updated_at'>) {
    return this.request<{ message: string; profile: Profile }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getProfile(): Promise<Profile> {
    return this.request<Profile>('/api/profile');
  }

  async updateProfile(profile: Partial<Profile>) {
    return this.request<{ message: string; profile: Profile }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getUserProfile(userId: string): Promise<Profile> {
    return this.request<Profile>(`/api/profiles/${userId}`);
  }

  // Posts methods
  async createPost(post: { content: string; image_url?: string; place_id?: string; post_type?: string }) {
    return this.request<{ message: string; post: Post }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async getPosts(limit = 20, offset = 0): Promise<{ posts: Post[] }> {
    return this.request<{ posts: Post[] }>(`/api/posts?limit=${limit}&offset=${offset}`);
  }

  async getPost(postId: string): Promise<Post> {
    return this.request<Post>(`/api/posts/${postId}`);
  }

  async likePost(postId: string): Promise<{ message: string; liked: boolean }> {
    return this.request<{ message: string; liked: boolean }>(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async savePost(postId: string): Promise<{ message: string; saved: boolean }> {
    return this.request<{ message: string; saved: boolean }>(`/api/posts/${postId}/save`, {
      method: 'POST',
    });
  }

  // Places methods
  async createPlace(place: Omit<Place, 'id' | 'rating' | 'created_by' | 'created_at'>) {
    return this.request<{ message: string; place: Place }>('/api/places', {
      method: 'POST',
      body: JSON.stringify(place),
    });
  }

  async getPlaces(category?: string, hidden?: boolean): Promise<{ places: Place[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (hidden !== undefined) params.append('hidden', hidden.toString());
    
    return this.request<{ places: Place[] }>(`/api/places?${params.toString()}`);
  }

  // Events methods
  async createEvent(event: Omit<Event, 'id' | 'attendees_count' | 'organizer_id' | 'created_at'>) {
    return this.request<{ message: string; event: Event }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getEvents(category?: string): Promise<{ events: Event[] }> {
    const params = category ? `?category=${category}` : '';
    return this.request<{ events: Event[] }>(`/api/events${params}`);
  }

  async rsvpEvent(eventId: string, status: 'going' | 'interested' | 'not_going') {
    return this.request<{ message: string; rsvp: any }>(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Connections methods
  async followUser(userId: string): Promise<{ message: string; following: boolean }> {
    return this.request<{ message: string; following: boolean }>(`/api/connections/${userId}/follow`, {
      method: 'POST',
    });
  }

  async getFollowers(): Promise<{ followers: Connection[] }> {
    return this.request<{ followers: Connection[] }>('/api/connections/followers');
  }

  async getFollowing(): Promise<{ following: Connection[] }> {
    return this.request<{ following: Connection[] }>('/api/connections/following');
  }

  // Badges methods
  async getBadges(): Promise<{ badges: Badge[] }> {
    return this.request<{ badges: Badge[] }>('/api/badges');
  }

  async getUserBadges(): Promise<{ user_badges: UserBadge[] }> {
    return this.request<{ user_badges: UserBadge[] }>('/api/user-badges');
  }

  // Feed method
  async getFeed(limit = 20, offset = 0): Promise<{ feed: Post[] }> {
    return this.request<{ feed: Post[] }>(`/v1/feed?limit=${limit}&offset=${offset}`);
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      throw new Error(`Backend connection failed: ${error.message}`);
    }
  }

  // Follow methods
  async followUser(userId: string): Promise<{ message: string; following: boolean }> {
    return this.request<{ message: string; following: boolean }>(`/v1/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<{ message: string; following: boolean }> {
    return this.request<{ message: string; following: boolean }>(`/v1/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  async getUserFollowers(userId: string): Promise<{ followers: Profile[] }> {
    return this.request<{ followers: Profile[] }>(`/v1/users/${userId}/followers`);
  }

  async getUserFollowing(userId: string): Promise<{ following: Profile[] }> {
    return this.request<{ following: Profile[] }>(`/v1/users/${userId}/following`);
  }

  // Events methods
  async getNearbyEvents(latitude: number, longitude: number, radius?: number): Promise<{ events: Event[] }> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) {
      params.append('distance_km', radius.toString());
    }
    return this.request<Event[]>(`/api/v1/events?${params.toString()}`);
  }

  async rsvpToEvent(eventId: string, status: 'going' | 'interested' | 'not_going'): Promise<{ message: string; rsvp: any }> {
    return this.request<{ message: string; rsvp: any }>(`/v1/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

}

export const apiClient = new ApiClient();