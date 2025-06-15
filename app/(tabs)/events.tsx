import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  Ticket,
  Plus,
  Filter,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { apiClient } from '../../lib/api';
import { useAuth } from '@/hooks/useAuth';

interface EventCardData {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: string;
  attendees: number;
  maxAttendees?: number;
  organizer: {
    name: string;
    avatar: string;
  };
  isGoing: boolean;
  isInterested: boolean;
  eventDateTime?: Date;
}

const eventCategories = [
  { id: 'all', name: 'All Events', color: '#007AFF' },
  { id: 'music', name: 'Music', color: '#FF9500' },
  { id: 'food', name: 'Food & Drink', color: '#34C759' },
  { id: 'art', name: 'Art & Culture', color: '#AF52DE' },
  { id: 'sports', name: 'Sports', color: '#FF3B30' },
  { id: 'tech', name: 'Tech', color: '#5AC8FA' },
  { id: 'outdoor', name: 'Outdoor', color: '#32D74B' },
  { id: 'social', name: 'Social', color: '#FF2D92' },
  { id: 'wellness', name: 'Wellness', color: '#30D158' },
];


const EventCard = ({ event, index, onRsvpUpdate }: { event: EventCardData; index: number; onRsvpUpdate: (eventId: string, status: string, prevStatus?: { isGoing: boolean; isInterested: boolean }) => void }) => {
  const [isGoing, setIsGoing] = useState(event.isGoing);
  const [isInterested, setIsInterested] = useState(event.isInterested);
  const [isLiked, setIsLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = () => {
    if (isGoing) return '#34C759';
    if (isInterested) return '#FF9500';
    return '#8E8E93';
  };

  const getStatusText = () => {
    if (isGoing) return 'Going';
    if (isInterested) return 'Interested';
    return 'Not Going';
  };

  const handleRSVP = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    let newStatus: 'going' | 'interested' | 'not_going';

    if (isGoing) {
      newStatus = 'not_going';
    } else if (isInterested) {
      newStatus = 'going';
    } else {
      newStatus = 'interested';
    }

    const prevGoing = isGoing;
    const prevInterested = isInterested;

    if (newStatus === 'going') {
      setIsGoing(true);
      setIsInterested(false);
    } else if (newStatus === 'interested') {
      setIsGoing(false);
      setIsInterested(true);
    } else {
      setIsGoing(false);
      setIsInterested(false);
    }

    try {
      await apiClient.rsvpToEvent(event.id, newStatus);
      onRsvpUpdate(event.id, newStatus, { isGoing: prevGoing, isInterested: prevInterested });
    } catch (error) {
      setIsGoing(prevGoing);
      setIsInterested(prevInterested);
      Alert.alert('Error', 'Failed to update RSVP. Please try again.');
      console.error('Error updating RSVP:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.eventCard}
    >
      <TouchableOpacity activeOpacity={0.95}>
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventDateBadge}>
            <Text style={styles.eventDateText}>{event.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventPrice}>
              {event.price !== 'Free' ? `$${event.price}` : event.price}
            </Text>
          </View>

          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Clock color="#8E8E93" size={14} strokeWidth={2} />
              <Text style={styles.eventDetailText}>{event.time}</Text>
            </View>
            <View style={styles.eventDetail}>
              <MapPin color="#8E8E93" size={14} strokeWidth={2} />
              <Text style={styles.eventDetailText}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.attendeesContainer}>
            <Users color="#8E8E93" size={16} strokeWidth={2} />
            <Text style={styles.attendeesText}>
              {event.attendees} going
              {event.maxAttendees && ` • ${event.maxAttendees - event.attendees} spots left`}
            </Text>
          </View>

          <View style={styles.organizerContainer}>
            <Image source={{ uri: event.organizer.avatar }} style={styles.organizerAvatar} />
            <Text style={styles.organizerName}>Organized by {event.organizer.name}</Text>
          </View>

          <View style={styles.eventActions}>
            <TouchableOpacity
              style={[styles.rsvpButton, isUpdating && styles.rsvpButtonDisabled]}
              onPress={handleRSVP}
              disabled={isUpdating}
            >
              <Text style={styles.rsvpButtonText}>
                {isUpdating ? 'Updating...' : isGoing ? 'Going ✓' : isInterested ? 'Interested' : 'RSVP'}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsLiked(!isLiked)}
              >
                <Heart
                  color={isLiked ? "#FF3B30" : "#8E8E93"}
                  fill={isLiked ? "#FF3B30" : "transparent"}
                  size={20}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Share2 color="#8E8E93" size={20} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ticket color="#8E8E93" size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function EventsScreen() {
  const { activitiesLoading, loadActivities, refreshActivities, getCachedEvents, updateCachedEventRsvp } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState<EventCardData[]>([]);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cachedEvents = getCachedEvents();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === categoryId));
    }
  };

  const cleanupPastEvents = async (eventsList: EventCardData[]): Promise<EventCardData[]> => {
    try {
      const now = new Date();
      const pastEvents = eventsList.filter(event => {
        if (!event.eventDateTime) return false;
        return event.eventDateTime < now;
      });

      const futureEvents = eventsList.filter(event => {
        if (!event.eventDateTime) return true; // Keep events without dates
        return event.eventDateTime >= now;
      });

      if (pastEvents.length > 0) {

        try {
          await apiClient.deletePastEvents();
        } catch (error) {
          console.error('Failed to cleanup past events:', error);
        }
      }

      return futureEvents;
    } catch (error) {
      console.error('Error during past events cleanup:', error);
      return eventsList; // Return original list if cleanup fails
    }
  };

  const loadEvents = async (forceRefresh = false) => {
    // Use cached data if available and not forcing refresh
    if (!forceRefresh && cachedEvents.length > 0) {
      const transformedEvents = transformCachedEvents(cachedEvents);

      // Check for and delete past events after sorting
      const futureEvents = await cleanupPastEvents(transformedEvents);

      setEvents(futureEvents);
      setFilteredEvents(futureEvents);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const isAuth = await apiClient.isAuthenticated();
      if (!isAuth) {
        setError('Please log in to view events');
        return;
      }

      const result = await apiClient.getEvents(selectedCategory === 'all' ? undefined : selectedCategory);

      if (result && result.events) {
        const transformedEvents: EventCardData[] = result.events.map((event: any) => {
          const eventDate = new Date(event.event_date);
          const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          const organizerProfile = event.profiles || event.organizer_profile;

          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            image: event.image_url && event.image_url.trim() !== '' ? event.image_url : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
            date: dateStr,
            time: timeStr,
            location: event.location,
            category: event.category,
            price: event.price || 'Free',
            attendees: event.attendees_count,
            maxAttendees: event.max_attendees,
            organizer: {
              name: organizerProfile?.full_name || organizerProfile?.username || 'Unknown Organizer',
              avatar: organizerProfile?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
            },
            isGoing: event.user_rsvp_status === 'going',
            isInterested: event.user_rsvp_status === 'interested',
            eventDateTime: eventDate
          };
        });

        const futureEvents = await cleanupPastEvents(transformedEvents);

        setEvents(futureEvents);
        setFilteredEvents(futureEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const transformCachedEvents = (cachedEvents: any[]): EventCardData[] => {
    return cachedEvents.map((activity: any) => {
      const eventId = activity.id.replace('event-', '');

      const eventDate = activity.eventDate ? new Date(activity.eventDate) : new Date();
      const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      return {
        id: eventId,
        title: activity.title,
        description: activity.description || activity.title,
        image: activity.imageUrl,
        date: dateStr,
        time: timeStr,
        location: activity.location || 'Location TBD',
        category: activity.category || 'all',
        price: activity.price || 'Free',
        attendees: activity.attendees || 0,
        maxAttendees: activity.maxAttendees,
        organizer: {
          name: 'Event Organizer',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        isGoing: activity.userRsvpStatus === 'going',
        isInterested: activity.userRsvpStatus === 'interested',
        eventDateTime: eventDate
      };
    });
  };


  const handleRsvpUpdate = (eventId: string, status: string, prevStatus?: { isGoing: boolean; isInterested: boolean }) => {
    const updateEvent = (event: EventCardData) => {
      if (event.id !== eventId) return event;

      let attendeeChange = 0;
      const wasGoing = prevStatus?.isGoing || event.isGoing;
      const willBeGoing = status === 'going';

      // Calculate attendee count change
      if (wasGoing && !willBeGoing) {
        attendeeChange = -1;
      } else if (!wasGoing && willBeGoing) {
        attendeeChange = 1;
      }

      return {
        ...event,
        isGoing: status === 'going',
        isInterested: status === 'interested',
        attendees: Math.max(0, event.attendees + attendeeChange)
      };
    };

    setEvents(prevEvents => prevEvents.map(updateEvent));
    setFilteredEvents(prevEvents => prevEvents.map(updateEvent));

    updateCachedEventRsvp(eventId, status as 'going' | 'interested' | 'not_going');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshActivities();
      await loadEvents(true);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate real stats from event data
  const calculateEventStats = () => {
    const now = new Date();

    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get the end of the current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Count events this week - use cached events with better date access
    let eventsThisWeek = 0;

    // Check cached events first (they have eventDate field)
    const cachedEventsWithDates = cachedEvents.filter(activity => {
      if (activity.eventDate) {
        const eventDate = new Date(activity.eventDate);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      }
      return false;
    });

    // If we have cached events with proper dates, use those
    if (cachedEventsWithDates.length > 0) {
      eventsThisWeek = cachedEventsWithDates.length;
    } else {
      // Fallback to parsing display dates from events array
      eventsThisWeek = events.filter(event => {
        if (!event.date) return false;

        // Parse the date string (format: "Dec 15", "Jan 2", etc.)
        const eventDate = new Date();
        const dateStr = event.date; // e.g., "Dec 15"
        const parts = dateStr.split(' ');

        if (parts.length >= 2) {
          const [month, day] = parts;

          // Map month abbreviations to numbers
          const monthMap: { [key: string]: number } = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };

          if (monthMap[month] !== undefined && !isNaN(parseInt(day))) {
            eventDate.setMonth(monthMap[month]);
            eventDate.setDate(parseInt(day));
            eventDate.setFullYear(now.getFullYear());

            // If the event date is in the past, assume it's next year
            if (eventDate < now) {
              eventDate.setFullYear(now.getFullYear() + 1);
            }

            return eventDate >= startOfWeek && eventDate <= endOfWeek;
          }
        }
        return false;
      }).length;
    }

    // Count going and interested events
    const goingCount = events.filter(event => event.isGoing).length;
    const interestedCount = events.filter(event => event.isInterested).length;

    return {
      eventsThisWeek,
      goingCount,
      interestedCount
    };
  };

  useEffect(() => {
    // Load activities first, then load events
    loadActivities().then(() => {
      loadEvents();
    });
  }, []);

  useEffect(() => {
    handleCategorySelect(selectedCategory);
  }, [events]);

  useEffect(() => {
    // Force refresh when category changes
    loadEvents(true);
  }, [selectedCategory]);

  useEffect(() => {
    // Update events when cached activities change
    if (cachedEvents.length > 0 && events.length === 0) {
      const transformedEvents = transformCachedEvents(cachedEvents);

      // Clean up past events
      cleanupPastEvents(transformedEvents).then(futureEvents => {
        setEvents(futureEvents);
        setFilteredEvents(futureEvents);
      });
    }
  }, [cachedEvents]);

  const renderCategory = ({ item }: { item: typeof eventCategories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && [styles.selectedCategoryChip, { backgroundColor: item.color }],
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInRight.delay(100)} style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#007AFF" size={20} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/create-event')}>
            <Plus color="#FFFFFF" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            title="Pull to refresh events"
            titleColor="#8E8E93"
          />
        }
      >
        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.categoriesSection}>
          <FlatList
            data={eventCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsSection}>
          {(() => {
            const stats = calculateEventStats();
            return (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.eventsThisWeek}</Text>
                  <Text style={styles.statLabel}>Events This Week</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.goingCount}</Text>
                  <Text style={styles.statLabel}>Going</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.interestedCount}</Text>
                  <Text style={styles.statLabel}>Interested</Text>
                </View>
              </>
            );
          })()}
        </Animated.View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Upcoming Events' : eventCategories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.resultCount}>{filteredEvents.length} events</Text>
          </Animated.View>

          {(loading || activitiesLoading) ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadEvents(true)}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} onRsvpUpdate={handleRsvpUpdate} />
              ))}
              {filteredEvents.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No events found</Text>
                  <Text style={styles.emptyStateSubtext}>Try selecting a different category or check back later</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  categoriesSection: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    textAlign: 'center',
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  resultCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventDateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eventDateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  eventPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#34C759',
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  attendeesText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  organizerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  organizerName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  rsvpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  rsvpButtonDisabled: {
    opacity: 0.6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
});