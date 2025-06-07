import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Camera,
  Bookmark,
  Heart,
  Eye,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  distance: string;
  likes: number;
  views: number;
  isHidden: boolean;
  author?: {
    name: string;
    avatar: string;
  };
}

const categories = [
  { id: 'all', name: 'All', icon: '🌍' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'adventure', name: 'Adventure', icon: '⛰️' },
  { id: 'culture', name: 'Culture', icon: '🏛️' },
  { id: 'nightlife', name: 'Nightlife', icon: '🌃' },
  { id: 'nature', name: 'Nature', icon: '🌲' },
  { id: 'hidden', name: 'Hidden', icon: '💎' },
];

const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Secret Garden Café',
    description: 'A hidden café behind a bookstore with the most amazing matcha lattes and homemade pastries.',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'food',
    rating: 4.9,
    distance: '0.3 km',
    likes: 342,
    views: 1250,
    isHidden: true,
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  },
  {
    id: '2',
    name: 'Underground Jazz Club',
    description: 'Intimate jazz club in a basement with live music every night. Perfect for a romantic evening.',
    image: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'nightlife',
    rating: 4.7,
    distance: '1.2 km',
    likes: 189,
    views: 890,
    isHidden: false,
    author: {
      name: 'Marcus Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  },
  {
    id: '3',
    name: 'Rooftop Yoga Studio',
    description: 'Practice yoga with stunning city views. Classes available at sunrise and sunset.',
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'adventure',
    rating: 4.8,
    distance: '0.8 km',
    likes: 267,
    views: 1100,
    isHidden: false,
  },
  {
    id: '4',
    name: 'Artist\'s Workshop',
    description: 'Local artists showcase their work and offer hands-on workshops. A true cultural experience.',
    image: 'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'culture',
    rating: 4.6,
    distance: '2.1 km',
    likes: 156,
    views: 650,
    isHidden: true,
    author: {
      name: 'Elena Rodriguez',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  },
  {
    id: '5',
    name: 'Hidden Waterfall Trail',
    description: 'A short hike leads to this breathtaking waterfall. Perfect for photography and meditation.',
    image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'nature',
    rating: 4.9,
    distance: '5.2 km',
    likes: 423,
    views: 2100,
    isHidden: true,
  },
  {
    id: '6',
    name: 'Vintage Record Store',
    description: 'Discover rare vinyl records and enjoy live acoustic sessions on weekends.',
    image: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'culture',
    rating: 4.5,
    distance: '1.5 km',
    likes: 98,
    views: 450,
    isHidden: false,
  },
];

const PlaceCard = ({ place, index }: { place: Place; index: number }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.placeCard}
    >
      <TouchableOpacity activeOpacity={0.95}>
        <View style={styles.placeImageContainer}>
          <Image source={{ uri: place.image }} style={styles.placeImage} />
          
          {place.isHidden && (
            <View style={styles.hiddenBadge}>
              <Text style={styles.hiddenBadgeText}>Hidden Gem 💎</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Bookmark
              color={isSaved ? "#007AFF" : "#FFFFFF"}
              fill={isSaved ? "#007AFF" : "transparent"}
              size={18}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.placeContent}>
          <View style={styles.placeHeader}>
            <Text style={styles.placeName}>{place.name}</Text>
            <View style={styles.ratingContainer}>
              <Star color="#FFD700" fill="#FFD700" size={14} strokeWidth={2} />
              <Text style={styles.ratingText}>{place.rating}</Text>
            </View>
          </View>

          <Text style={styles.placeDescription} numberOfLines={2}>
            {place.description}
          </Text>

          <View style={styles.placeDetails}>
            <View style={styles.locationContainer}>
              <MapPin color="#8E8E93" size={12} strokeWidth={2} />
              <Text style={styles.distanceText}>{place.distance}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Eye color="#8E8E93" size={12} strokeWidth={2} />
                <Text style={styles.statText}>{place.views}</Text>
              </View>
              <View style={styles.stat}>
                <Heart
                  color={isLiked ? "#FF3B30" : "#8E8E93"}
                  fill={isLiked ? "#FF3B30" : "transparent"}
                  size={12}
                  strokeWidth={2}
                />
                <Text style={styles.statText}>{place.likes + (isLiked ? 1 : 0)}</Text>
              </View>
            </View>
          </View>

          {place.author && (
            <View style={styles.authorContainer}>
              <Image source={{ uri: place.author.avatar }} style={styles.authorAvatar} />
              <Text style={styles.authorName}>Recommended by {place.author.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPlaces, setFilteredPlaces] = useState(mockPlaces);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredPlaces(mockPlaces);
    } else if (categoryId === 'hidden') {
      setFilteredPlaces(mockPlaces.filter(place => place.isHidden));
    } else {
      setFilteredPlaces(mockPlaces.filter(place => place.category === categoryId));
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      handleCategorySelect(selectedCategory);
    } else {
      const filtered = mockPlaces.filter(place =>
        place.name.toLowerCase().includes(text.toLowerCase()) ||
        place.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }
  };

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.icon}</Text>
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
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera color="#007AFF" size={24} strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#8E8E93" size={20} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, events, or users"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#007AFF" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.categoriesSection}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </Animated.View>

        {/* Local Insights */}
        <View style={styles.placesSection}>
          <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'hidden' ? 'Hidden Gems' : 'Local Insights'}
            </Text>
            <Text style={styles.resultCount}>{filteredPlaces.length} places</Text>
          </Animated.View>

          <View style={styles.placesGrid}>
            {filteredPlaces.map((place, index) => (
              <PlaceCard key={place.id} place={place} index={index} />
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
  cameraButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
  },
  filterButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  selectedCategoryChip: {
    backgroundColor: '#007AFF',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  placesSection: {
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
  placesGrid: {
    gap: 16,
  },
  placeCard: {
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
  placeImageContainer: {
    position: 'relative',
    height: 200,
  },
  placeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hiddenBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hiddenBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 8,
  },
  placeContent: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  placeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 12,
  },
  placeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
});