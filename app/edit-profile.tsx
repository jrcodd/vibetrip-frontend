import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { profile, updateProfile: updateAuthProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    travel_style: '',
    interests: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        travel_style: profile.travel_style || '',
        interests: profile.interests || [],
      });
    }
  }, [profile]);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to select an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
      Alert.alert('Error', 'Failed to select avatar');
    }
  };

  const takeAvatarPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permissions are required to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking avatar photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showAvatarOptions = () => {
    Alert.alert(
      'Select Avatar',
      'Choose how you want to add your avatar',
      [
        { text: 'Camera', onPress: takeAvatarPhoto },
        { text: 'Photo Library', onPress: pickAvatar },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    setLoading(true);
    try {
      let updateData = { ...formData };

      // Upload avatar if one was selected (copying event photo upload pattern)
      let avatarUrl = updateData.avatar_url;
      if (selectedAvatar) {
        setUploadingAvatar(true);
        try {
          const uploadResult = await apiClient.uploadImage(selectedAvatar);
          avatarUrl = uploadResult.url;
          updateData.avatar_url = avatarUrl;
          console.log('Avatar uploaded successfully:', avatarUrl);
        } catch (uploadError: any) {
          console.error('Avatar upload failed:', uploadError);
          Alert.alert(
            'Warning', 
            'Profile will be updated but avatar upload failed. You can try uploading again later.',
            [{ text: 'OK' }]
          );
        } finally {
          setUploadingAvatar(false);
        }
      }

      await updateAuthProfile(updateData);
      
      // Force refresh the profile to ensure latest data is loaded
      await refreshProfile(true);
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const interestOptions = [
    'Adventure', 'Food & Drink', 'Culture', 'Photography', 'Nature',
    'Music', 'Art', 'Sports', 'Nightlife', 'Shopping', 'History', 'Wellness'
  ];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft color="#007AFF" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Save color="#FFFFFF" size={20} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Photo Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {selectedAvatar || profile?.avatar_url ? (
                <TouchableOpacity 
                  style={styles.avatarContainer}
                  onPress={showAvatarOptions}
                  disabled={uploadingAvatar}
                >
                  <Image 
                    source={{ uri: selectedAvatar || profile?.avatar_url }} 
                    style={styles.avatarImage}
                  />
                  {uploadingAvatar && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.photoPlaceholder}
                  onPress={showAvatarOptions}
                  disabled={uploadingAvatar}
                >
                  <Camera color="#8E8E93" size={32} strokeWidth={2} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={showAvatarOptions}
                disabled={uploadingAvatar}
              >
                <Text style={styles.changePhotoText}>
                  {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.textInput}
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                placeholder="Enter your username"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Where are you based?"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Travel Style</Text>
              <TextInput
                style={styles.textInput}
                value={formData.travel_style}
                onChangeText={(text) => setFormData(prev => ({ ...prev, travel_style: text }))}
                placeholder="Backpacker, Luxury, Solo, etc."
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Interests</Text>
              <View style={styles.interestsContainer}>
                {interestOptions.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      formData.interests.includes(interest) && styles.selectedInterestChip
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[
                      styles.interestText,
                      formData.interests.includes(interest) && styles.selectedInterestText
                    ]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  photoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  changePhotoText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bioInput: {
    height: 80,
    paddingTop: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedInterestChip: {
    backgroundColor: '#007AFF',
  },
  interestText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  selectedInterestText: {
    color: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});