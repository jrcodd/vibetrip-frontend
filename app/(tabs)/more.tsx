import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CircleHelp as HelpCircle, Shield, Bell, Globe, CreditCard, Download, Book, Info, LogOut, ChevronRight, Moon, Smartphone, Volume2, Mail, MessageCircle, Star, Heart, MapPin, Camera } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  color: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  badge?: string;
}

const menuSections: MenuSection[] = [
  {
    title: 'Account',
    items: [
      {
        id: 'settings',
        title: 'App Settings',
        subtitle: 'Notifications, privacy, preferences',
        icon: Settings,
        color: '#8E8E93',
      },
      {
        id: 'privacy',
        title: 'Privacy & Security',
        subtitle: 'Control your data and privacy',
        icon: Shield,
        color: '#007AFF',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Manage notification preferences',
        icon: Bell,
        color: '#FF9500',
      },
    ],
  },
  {
    title: 'Travel Tools',
    items: [
      {
        id: 'offline',
        title: 'Offline Maps',
        subtitle: 'Download for offline access',
        icon: Download,
        color: '#34C759',
      },
      {
        id: 'currency',
        title: 'Currency Converter',
        subtitle: 'Real-time exchange rates',
        icon: CreditCard,
        color: '#FF3B30',
      },
      {
        id: 'language',
        title: 'Language Tools',
        subtitle: 'Translation and phrase book',
        icon: Globe,
        color: '#AF52DE',
      },
      {
        id: 'packing',
        title: 'Packing Lists',
        subtitle: 'Smart packing suggestions',
        icon: Book,
        color: '#5AC8FA',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        id: 'blog',
        title: 'VibeTrip Stories',
        subtitle: 'Travel inspiration and guides',
        icon: Book,
        color: '#FF9500',
        badge: 'New',
      },
      {
        id: 'saved',
        title: 'Saved Places',
        subtitle: 'Your bookmarked locations',
        icon: Heart,
        color: '#FF3B30',
      },
      {
        id: 'photos',
        title: 'My Travel Photos',
        subtitle: 'Your captured memories',
        icon: Camera,
        color: '#5AC8FA',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'FAQs and customer support',
        icon: HelpCircle,
        color: '#34C759',
      },
      {
        id: 'feedback',
        title: 'Send Feedback',
        subtitle: 'Help us improve VibeTrip',
        icon: MessageCircle,
        color: '#007AFF',
      },
      {
        id: 'rate',
        title: 'Rate App',
        subtitle: 'Love VibeTrip? Leave a review',
        icon: Star,
        color: '#FFD700',
      },
      {
        id: 'about',
        title: 'About VibeTrip',
        subtitle: 'Our story and mission',
        icon: Info,
        color: '#8E8E93',
      },
    ],
  },
];

const quickSettings = [
  {
    id: 'darkMode',
    title: 'Dark Mode',
    icon: Moon,
    color: '#8E8E93',
    hasSwitch: true,
    switchValue: false,
  },
  {
    id: 'notifications',
    title: 'Push Notifications',
    icon: Bell,
    color: '#FF9500',
    hasSwitch: true,
    switchValue: true,
  },
  {
    id: 'location',
    title: 'Location Services',
    icon: MapPin,
    color: '#007AFF',
    hasSwitch: true,
    switchValue: true,
  },
];

const MenuItemCard = ({ item, index }: { item: MenuItem; index: number }) => (
  <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
          <item.icon color={item.color} size={20} strokeWidth={2} />
        </View>
        <View style={styles.menuItemContent}>
          <View style={styles.titleRow}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <ChevronRight color="#C7C7CC" size={16} strokeWidth={2} />
        )}
      </View>
    </TouchableOpacity>
  </Animated.View>
);

const QuickSettingCard = ({ item, index }: { item: MenuItem; index: number }) => (
  <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
    <TouchableOpacity style={styles.quickSettingItem}>
      <View style={[styles.quickSettingIcon, { backgroundColor: `${item.color}15` }]}>
        <item.icon color={item.color} size={24} strokeWidth={2} />
      </View>
      <Text style={styles.quickSettingTitle}>{item.title}</Text>
      {item.hasSwitch && (
        <Switch
          value={item.switchValue}
          onValueChange={() => {}}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor="#FFFFFF"
          style={styles.quickSettingSwitch}
        />
      )}
    </TouchableOpacity>
  </Animated.View>
);

export default function MoreScreen() {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInRight.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
          <Text style={styles.headerSubtitle}>Settings, tools, and support</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri: profile?.avatar_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
              }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {profile?.full_name || profile?.username || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || 'No email'}
              </Text>
              <View style={styles.profileStats}>
                <Text style={styles.profileStat}>
                  {profile?.places_visited || 0} places visited
                </Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.profileStat}>
                  {profile?.badges_earned || 0} badges earned
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Settings */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.quickSettingsSection}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          <View style={styles.quickSettingsGrid}>
            {quickSettings.map((item, index) => (
              <QuickSettingCard key={item.id} item={item} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay((sectionIndex + 4) * 100).springify()}
            style={styles.menuSection}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuItems}>
              {section.items.map((item, itemIndex) => (
                <MenuItemCard key={item.id} item={item} index={itemIndex} />
              ))}
            </View>
          </Animated.View>
        ))}

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.appInfoSection}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>VibeTrip</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Find Your Vibe, Live Your Adventure
            </Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut color="#FF3B30" size={20} strokeWidth={2} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomPadding} />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileDetails: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  profileStat: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  statDivider: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  editProfileButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  quickSettingsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  quickSettingsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickSettingItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickSettingIcon: {
    borderRadius: 20,
    padding: 12,
  },
  quickSettingTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  quickSettingSwitch: {
    transform: [{ scale: 0.8 }],
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    borderRadius: 20,
    padding: 8,
  },
  menuItemContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  menuItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3C3C43',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F0',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF3B30',
  },
  bottomPadding: {
    height: 100,
  },
});