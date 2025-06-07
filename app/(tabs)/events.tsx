import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
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

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Rooftop Jazz Night',
    description: 'Experience the best jazz musicians in the city with stunning skyline views.',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: 'March 15',
    time: '8:00 PM',
    location: 'Sky Lounge, Downtown',
    category: 'music',
    price: '$25',
    attendees: 89,
    maxAttendees: 120,
    organizer: {
      name: 'Blue Note Events',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    isGoing: false,
    isInterested: true,
  },
  {
    id: '2',
    title: 'Street Food Festival',
    description: 'Taste the best street food from around the world with live cooking demos.',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: 'March 18',
    time: '12:00 PM',
    location: 'Central Park',
    category: 'food',
    price: 'Free',
    attendees: 234,
    maxAttendees: 500,
    organizer: {
      name: 'Foodie Collective',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    isGoing: true,
    isInterested: false,
  },
  {
    id: '3',
    title: 'Modern Art Exhibition',
    description: 'Discover emerging artists and their groundbreaking contemporary works.',
    image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: 'March 20',
    time: '6:00 PM',
    location: 'Gallery District',
    category: 'art',
    price: '$15',
    attendees: 67,
    maxAttendees: 80,
    organizer: {
      name: 'Modern Gallery',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    isGoing: false,
    isInterested: false,
  },
  {
    id: '4',
    title: 'Tech Startup Meetup',
    description: 'Network with fellow entrepreneurs and learn about the latest tech trends.',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: 'March 22',
    time: '7:00 PM',
    location: 'Innovation Hub',
    category: 'tech',
    price: 'Free',
    attendees: 156,
    maxAttendees: 200,
    organizer: {
      name: 'Tech Connect',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    isGoing: false,
    isInterested: true,
  },
  {
    id: '5',
    title: 'Beach Volleyball Tournament',
    description: 'Join the ultimate beach volleyball competition with prizes and refreshments.',
    image: 'https://images.pexels.com/photos/1263317/pexels-photo-1263317.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: 'March 25',
    time: '10:00 AM',
    location: 'Sunset Beach',
    category: 'sports',
    price: '$20',
    attendees: 45,
    maxAttendees: 64,
    organizer: {
      name: 'Beach Sports Club',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    isGoing: false,
    isInterested: false,
  },
];

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const [isGoing, setIsGoing] = useState(event.isGoing);
  const [isInterested, setIsInterested] = useState(event.isInterested);
  const [isLiked, setIsLiked] = useState(false);

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

  const handleRSVP = () => {
    if (isGoing) {
      setIsGoing(false);
      setIsInterested(false);
    } else if (isInterested) {
      setIsGoing(true);
      setIsInterested(false);
    } else {
      setIsInterested(true);
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
            <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
              <Text style={styles.rsvpButtonText}>
                {isGoing ? 'Going ✓' : isInterested ? 'Interested' : 'RSVP'}
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
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredEvents(mockEvents);
    } else {
      setFilteredEvents(mockEvents.filter(event => event.category === categoryId));
    }
  };

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

          <View style={styles.eventsList}>
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </View>
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
});