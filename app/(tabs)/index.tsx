import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  MapPin,
  Heart,
  Share2,
  Star,
  Bookmark,
  TrendingUp,
  Award,
  Camera,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { router } from 'expo-router';
import type { Post } from '@/lib/supabase';

const FeedCard = ({ item, index }: { item: Post; index: number }) => {
  const scale = useSharedValue(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.98, { duration: 100 }, () => {
      scale.value = withSpring(1);
    });
  };

  const handleLike = async () => {
    try {
      const result = await apiClient.likePost(item.id);
      setIsLiked(result.liked);
      scale.value = withSpring(1.05, { duration: 100 }, () => {
        scale.value = withSpring(1);
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSave = async () => {
    try {
      const result = await apiClient.savePost(item.id);
      setIsSaved(result.saved);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.feedCard, animatedStyle]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: item.image_url || 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=800' }} style={styles.cardImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
          />

          {item.post_type === 'challenge' && (
            <View style={styles.badgeContainer}>
              <Award color="#FFD700" size={16} strokeWidth={2} />
              <Text style={styles.badgeText}>Challenge</Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Bookmark
              color={isSaved ? "#007AFF" : "#FFFFFF"}
              fill={isSaved ? "#007AFF" : "transparent"}
              size={20}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.content.split('\n')[0] || 'Travel Post'}</Text>
            {item.post_type === 'recommendation' && (
              <View style={styles.typeIndicator}>
                <TrendingUp color="#007AFF" size={12} strokeWidth={2} />
              </View>
            )}
          </View>

          <Text style={styles.cardDescription}>{item.content}</Text>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Heart
                color={isLiked ? "#FF3B30" : "#8E8E93"}
                fill={isLiked ? "#FF3B30" : "transparent"}
                size={20}
                strokeWidth={2}
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {item.likes_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Share2 color="#8E8E93" size={20} strokeWidth={2} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [greeting, setGreeting] = useState('');
  const [feedData, setFeedData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const result = await apiClient.safeRequest<{ feed: Post[] }>('/api/feed');
      if (result) {
        setFeedData(result.feed);
      } else {
        // Fallback to general posts if feed fails
        const postsResult = await apiClient.safeRequest<{ posts: Post[] }>('/api/posts');
        if (postsResult) {
          setFeedData(postsResult.posts);
        }
      }
    } catch (error) {
      console.log('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInRight.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.welcomeText}>
              {profile ? `Welcome back, ${profile.full_name || profile.username}!` : 'Ready for your next adventure?'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color="#007AFF" size={24} strokeWidth={2} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.quickActions}>
<TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/create-post')}>
            <Camera color="#007AFF" size={28} strokeWidth={2} />
            <Text style={styles.quickActionText}>Share Moment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <MapPin color="#34C759" size={28} strokeWidth={2} />
            <Text style={styles.quickActionText}>Nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <Award color="#FFD700" size={28} strokeWidth={2} />
            <Text style={styles.quickActionText}>Challenges</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Feed Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Your Vibe Feed</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your feed...</Text>
            </View>
          ) : feedData.length > 0 ? (
            feedData.map((item, index) => (
              <FeedCard key={item.id} item={item} index={index} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Start following people or create your first post!</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
  feedSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 240,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    flex: 1,
  },
  typeIndicator: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 6,
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#3C3C43',
    lineHeight: 22,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    flex: 1,
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
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  likedText: {
    color: '#FF3B30',
  },
});