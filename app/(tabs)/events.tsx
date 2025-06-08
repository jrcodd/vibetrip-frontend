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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
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
import * as Location from 'expo-location';
import { apiClient } from '../../lib/api';

const { width } = Dimensions.get('window');

interface Event {
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
}

const eventCategories = [
  { id: 'all', name: 'All Events', color: '#007AFF' },
  { id: 'music', name: 'Music', color: '#FF9500' },
  { id: 'food', name: 'Food & Drink', color: '#34C759' },
  { id: 'art', name: 'Art & Culture', color: '#AF52DE' },
  { id: 'sports', name: 'Sports', color: '#FF3B30' },
  { id: 'tech', name: 'Tech', color: '#5AC8FA' },
];


const EventCard = ({ event, index, onRsvpUpdate }: { event: Event; index: number; onRsvpUpdate: (eventId: string, status: string) => void }) => {
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

    // Optimistic update
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
      onRsvpUpdate(event.id, newStatus);
    } catch (error) {
      // Revert optimistic update on error
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
            <Text style={styles.eventPrice}>{event.price}</Text>
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === categoryId));
    }
  };

  const loadNearbyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isAuth = await apiClient.isAuthenticated();
      if (!isAuth) {
        setError('Please log in to view events');
        return;
      }

      if (!location) {
        setError('Location not available');
        return;
      }

      const result = await apiClient.getNearbyEvents(location.latitude, location.longitude);
      
      if (result) {
        setEvents(result);
        setFilteredEvents(selectedCategory === 'all' ? result : result.filter(event => event.category === selectedCategory));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location access to see nearby events.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to get your location. Please try again.');
    }
  };

  const handleRsvpUpdate = (eventId: string, status: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isGoing: status === 'going',
              isInterested: status === 'interested'
            }
          : event
      )
    );
    
    setFilteredEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isGoing: status === 'going',
              isInterested: status === 'interested'
            }
          : event
      )
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      loadNearbyEvents();
    }
  }, [location]);

  useEffect(() => {
    handleCategorySelect(selectedCategory);
  }, [events]);

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
          <TouchableOpacity style={styles.addButton}>
            <Plus color="#FFFFFF" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Events This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Going</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Interested</Text>
          </View>
        </Animated.View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'Upcoming Events' : eventCategories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.resultCount}>{filteredEvents.length} events</Text>
          </Animated.View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Finding nearby events...</Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
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
                  <Text style={styles.emptyStateText}>No events found in your area</Text>
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