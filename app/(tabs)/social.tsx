import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MessageCircle, Users, Award, MapPin, Camera, Settings, CreditCard as Edit3, Trophy, Target, Share2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

interface Connection {
  id: string;
  name: string;
  avatar: string;
  location: string;
  mutualFriends: number;
  isFollowing: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  category: string;
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'City Explorer',
    icon: '🏙️',
    description: 'Visited 10 different cities',
    earned: true,
    earnedDate: 'March 2024',
  },
  {
    id: '2',
    name: 'Foodie Master',
    icon: '🍕',
    description: 'Tried 50 local restaurants',
    earned: true,
    earnedDate: 'February 2024',
  },
  {
    id: '3',
    name: 'Adventure Seeker',
    icon: '⛰️',
    description: 'Completed 5 adventure activities',
    earned: false,
  },
  {
    id: '4',
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Connected with 100 travelers',
    earned: true,
    earnedDate: 'January 2024',
  },
  {
    id: '5',
    name: 'Photo Pro',
    icon: '📸',
    description: 'Shared 25 travel photos',
    earned: false,
  },
  {
    id: '6',
    name: 'Event Host',
    icon: '🎉',
    description: 'Organized 3 travel events',
    earned: false,
  },
];

const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Tokyo, Japan',
    mutualFriends: 12,
    isFollowing: true,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'New York, USA',
    mutualFriends: 8,
    isFollowing: false,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Barcelona, Spain',
    mutualFriends: 15,
    isFollowing: true,
  },
  {
    id: '4',
    name: 'Alex Kim',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Seoul, South Korea',
    mutualFriends: 5,
    isFollowing: false,
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Hidden Gem Hunter',
    description: 'Discover 15 hidden locations',
    progress: 8,
    total: 15,
    category: 'Exploration',
  },
  {
    id: '2',
    title: 'Cultural Immersion',
    description: 'Attend 10 cultural events',
    progress: 6,
    total: 10,
    category: 'Culture',
  },
  {
    id: '3',
    title: 'Travel Photographer',
    description: 'Get 500 likes on travel photos',
    progress: 342,
    total: 500,
    category: 'Photography',
  },
];

const BadgeCard = ({ badge, index }: { badge: Badge; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 50).springify()}
    style={[styles.badgeCard, !badge.earned && styles.unearned]}
  >
    <Text style={styles.badgeIcon}>{badge.icon}</Text>
    <Text style={[styles.badgeName, !badge.earned && styles.unearnedText]}>
      {badge.name}
    </Text>
    <Text style={[styles.badgeDescription, !badge.earned && styles.unearnedText]}>
      {badge.description}
    </Text>
    {badge.earned && badge.earnedDate && (
      <Text style={styles.earnedDate}>{badge.earnedDate}</Text>
    )}
  </Animated.View>
);

const ConnectionCard = ({ connection, index }: { connection: Connection; index: number }) => {
  const [isFollowing, setIsFollowing] = useState(connection.isFollowing);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.connectionCard}
    >
      <Image source={{ uri: connection.avatar }} style={styles.connectionAvatar} />
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionName}>{connection.name}</Text>
        <View style={styles.connectionDetails}>
          <MapPin color="#8E8E93" size={12} strokeWidth={2} />
          <Text style={styles.connectionLocation}>{connection.location}</Text>
        </View>
        <Text style={styles.mutualFriends}>
          {connection.mutualFriends} mutual connections
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.followButton, isFollowing && styles.followingButton]}
        onPress={() => setIsFollowing(!isFollowing)}
      >
        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AchievementCard = ({ achievement, index }: { achievement: Achievement; index: number }) => {
  const progressPercentage = (achievement.progress / achievement.total) * 100;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.achievementCard}
    >
      <View style={styles.achievementHeader}>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          <Text style={styles.achievementCategory}>{achievement.category}</Text>
        </View>
        <View style={styles.achievementProgress}>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.total}
          </Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
      </View>
    </Animated.View>
  );
};

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'connections' | 'achievements'>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Profile Stats */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>47</Text>
                <Text style={styles.statLabel}>Places Visited</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>23</Text>
                <Text style={styles.statLabel}>Events Attended</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Badges Earned</Text>
              </View>
            </Animated.View>

            {/* Recent Activity */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Award color="#FFD700" size={16} strokeWidth={2} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Earned "Foodie Master" badge</Text>
                    <Text style={styles.activityTime}>2 days ago</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MapPin color="#007AFF" size={16} strokeWidth={2} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Checked in at Secret Garden Café</Text>
                    <Text style={styles.activityTime}>1 week ago</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Users color="#34C759" size={16} strokeWidth={2} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Connected with 5 new travelers</Text>
                    <Text style={styles.activityTime}>2 weeks ago</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Badges */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Badges</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={mockBadges.slice(0, 4)}
                renderItem={({ item, index }) => <BadgeCard badge={item} index={index} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.badgesGrid}
              />
            </Animated.View>
          </ScrollView>
        );

      case 'connections':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.connectionsHeader}>
              <Text style={styles.connectionsTitle}>Your Travel Network</Text>
              <Text style={styles.connectionsSubtitle}>
                Connect with fellow travelers and locals
              </Text>
            </Animated.View>

            <View style={styles.connectionsList}>
              {mockConnections.map((connection, index) => (
                <ConnectionCard key={connection.id} connection={connection} index={index} />
              ))}
            </View>

            <Animated.View entering={FadeInDown.delay(600)} style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Suggested Connections</Text>
              <Text style={styles.suggestionsText}>
                Based on your interests and travel history
              </Text>
            </Animated.View>
          </ScrollView>
        );

      case 'achievements':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.achievementsHeader}>
              <Trophy color="#FFD700" size={32} strokeWidth={2} />
              <Text style={styles.achievementsTitle}>Your Progress</Text>
              <Text style={styles.achievementsSubtitle}>
                Complete challenges to unlock new badges
              </Text>
            </Animated.View>

            <View style={styles.achievementsList}>
              {mockAchievements.map((achievement, index) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={index} />
              ))}
            </View>

            <Animated.View entering={FadeInDown.delay(600)} style={styles.allBadgesSection}>
              <Text style={styles.sectionTitle}>All Badges</Text>
              <FlatList
                data={mockBadges}
                renderItem={({ item, index }) => <BadgeCard badge={item} index={index} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.badgesGrid}
              />
            </Animated.View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <Animated.View entering={FadeInRight.delay(100)} style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>Alex Morgan</Text>
            <Text style={styles.profileBio}>Digital nomad exploring the world 🌍</Text>
            <View style={styles.profileLocation}>
              <MapPin color="#8E8E93" size={14} strokeWidth={2} />
              <Text style={styles.locationText}>Currently in Tokyo, Japan</Text>
            </View>
          </View>
        </View>
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileActionButton}>
            <Edit3 color="#007AFF" size={18} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileActionButton}>
            <Share2 color="#007AFF" size={18} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileActionButton}>
            <Settings color="#007AFF" size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('profile')}
        >
          <User
            color={activeTab === 'profile' ? '#007AFF' : '#8E8E93'}
            size={20}
            strokeWidth={2}
          />
          <Text
            style={[styles.tabButtonText, activeTab === 'profile' && styles.activeTabButtonText]}
          >
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'connections' && styles.activeTabButton]}
          onPress={() => setActiveTab('connections')}
        >
          <Users
            color={activeTab === 'connections' ? '#007AFF' : '#8E8E93'}
            size={20}
            strokeWidth={2}
          />
          <Text
            style={[styles.tabButtonText, activeTab === 'connections' && styles.activeTabButtonText]}
          >
            Network
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'achievements' && styles.activeTabButton]}
          onPress={() => setActiveTab('achievements')}
        >
          <Target
            color={activeTab === 'achievements' ? '#007AFF' : '#8E8E93'}
            size={20}
            strokeWidth={2}
          />
          <Text
            style={[styles.tabButtonText, activeTab === 'achievements' && styles.activeTabButtonText]}
          >
            Progress
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  profileInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  profileDetails: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  profileBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3C3C43',
    lineHeight: 20,
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  profileActionButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 10,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  activeTabButtonText: {
    color: '#007AFF',
  },
  tabContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
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
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  badgesGrid: {
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  unearned: {
    borderColor: '#E5E5EA',
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  unearnedText: {
    color: '#C7C7CC',
  },
  earnedDate: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#34C759',
  },
  connectionsHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  connectionsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  connectionsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  connectionsList: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    gap: 12,
  },
  connectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  connectionInfo: {
    flex: 1,
    gap: 2,
  },
  connectionName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  connectionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectionLocation: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  mutualFriends: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  followButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followingButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  followButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#007AFF',
  },
  suggestionsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 12,
  },
  suggestionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 8,
  },
  achievementsHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  achievementsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  achievementsList: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  achievementCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementInfo: {
    flex: 1,
    marginRight: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3C3C43',
    marginBottom: 4,
  },
  achievementCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  achievementProgress: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  allBadgesSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 12,
    marginBottom: 100,
  },
});