import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  X,
  Camera,
  MapPin,
  Type,
  FileText,
  Hash,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../lib/api';

const postTypes = [
  { id: 'story', name: 'Story', description: 'Share your travel experience', color: '#007AFF' },
  { id: 'recommendation', name: 'Recommendation', description: 'Recommend a place or activity', color: '#34C759' },
  { id: 'challenge', name: 'Challenge', description: 'Challenge the community', color: '#FF9500' },
];

export default function CreatePostScreen() {
  const { refreshActivities } = useAuth();
  const [formData, setFormData] = useState({
    content: '',
    post_type: 'story',
    place_id: '', // Optional for now
    image_url: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostTypeSelect = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      post_type: typeId
    }));
  };

  const pickImage = async () => {
    try {
      console.log('Requesting media library permissions...');

      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload images. You can enable this in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings', onPress: () => {
                // For iOS, we can't directly open settings, but we can show instructions
                Alert.alert(
                  'Enable Photo Access',
                  'Go to Settings > Privacy & Security > Photos > [Your App Name] and allow access.'
                );
              }
            }
          ]
        );
        return;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        exif: false, // Don't include EXIF data to reduce file size
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        console.log('Selected image:', selectedAsset.uri);
        setSelectedImage(selectedAsset.uri);

        // Update form data with the image URI
        setFormData(prev => ({
          ...prev,
          image_url: selectedAsset.uri
        }));
      } else {
        console.log('Image selection was canceled or no assets found');
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Image Selection Failed',
        `Failed to pick image: ${error.message || 'Unknown error'}. Please try again or check your permissions.`
      );
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Requesting camera permissions...');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permissions to take photos. You can enable this in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings', onPress: () => {
                Alert.alert(
                  'Enable Camera Access',
                  'Go to Settings > Privacy & Security > Camera > [Your App Name] and allow access.'
                );
              }
            }
          ]
        );
        return;
      }

      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        exif: false,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        console.log('Photo taken:', selectedAsset.uri);
        setSelectedImage(selectedAsset.uri);
        setFormData(prev => ({
          ...prev,
          image_url: selectedAsset.uri
        }));
      } else {
        console.log('Photo capture was canceled or no assets found');
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Camera Error',
        `Failed to take photo: ${error.message || 'Unknown error'}. Please try again or check your permissions.`
      );
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo to your post',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = () => {
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please write something for your post');
      return false;
    }
    if (formData.content.trim().length < 10) {
      Alert.alert('Error', 'Your post should be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let imageUrl = undefined;

      // Upload image if one was selected
      if (selectedImage) {
        try {
          // Try post-images bucket first, then fallback to event-images
          let uploadResult;
          try {
            uploadResult = await apiClient.uploadImage(selectedImage, 'post-images');
          } catch (bucketError) {
            console.log('post-images bucket failed, trying event-images:', bucketError);
            // Fallback to event-images bucket which we know exists
            uploadResult = await apiClient.uploadImage(selectedImage, 'event-images');
          }
          
          imageUrl = uploadResult.url;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert(
            'Image Upload Warning',
            `Image upload failed: ${uploadError || 'Unknown error'}. The post will be created without an image.`,
            [{ text: 'Continue', style: 'default' }]
          );
        }
      }

      const postData = {
        content: formData.content.trim(),
        post_type: formData.post_type,
        ...(imageUrl && { image_url: imageUrl }),
        ...(formData.place_id.trim() && { place_id: formData.place_id.trim() }),
      };

      console.log('Creating post with data:', postData);
      await apiClient.createPost(postData);

      // Refresh activities cache to include the new post
      await refreshActivities();

      Alert.alert(
        'Success!',
        imageUrl ? 'Your post has been shared successfully with photo!' : 'Your post has been shared successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Post Creation Failed',
        error.message || 'Failed to create post. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="#1C1C1E" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Moment</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.shareButton, isLoading && styles.shareButtonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.shareButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
          <TouchableOpacity onPress={showImagePicker} style={styles.imageUpload}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color="#8E8E93" size={32} strokeWidth={2} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                <Text style={styles.imagePlaceholderSubtext}>Tap to select from library or take photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <FileText color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your travel story, experience, or thoughts..."
              value={formData.content}
              onChangeText={(value) => handleInputChange('content', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Post Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post Type</Text>
          <View style={styles.postTypesContainer}>
            {postTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => handlePostTypeSelect(type.id)}
                style={[
                  styles.postTypeCard,
                  formData.post_type === type.id && [
                    styles.selectedPostTypeCard,
                    { borderColor: type.color }
                  ],
                ]}
              >
                <View style={styles.postTypeHeader}>
                  <Text
                    style={[
                      styles.postTypeName,
                      formData.post_type === type.id && { color: type.color }
                    ]}
                  >
                    {type.name}
                  </Text>
                  {formData.post_type === type.id && (
                    <View style={[styles.selectedIndicator, { backgroundColor: type.color }]} />
                  )}
                </View>
                <Text style={styles.postTypeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Optional Place Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location (Optional)</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Where are you? (e.g., Paris, France)"
              value={formData.place_id}
              onChangeText={(value) => handleInputChange('place_id', value)}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  imageUpload: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginTop: 12,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  postTypesContainer: {
    gap: 12,
  },
  postTypeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  selectedPostTypeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  postTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  postTypeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  postTypeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  bottomSpacing: {
    height: 40,
  },
});
