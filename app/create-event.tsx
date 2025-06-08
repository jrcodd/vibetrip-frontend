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
import { 
  X, 
  Camera, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Type,
  FileText
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiClient } from '../lib/api';

const eventCategories = [
  { id: 'music', name: 'Music', color: '#FF9500' },
  { id: 'food', name: 'Food & Drink', color: '#34C759' },
  { id: 'art', name: 'Art & Culture', color: '#AF52DE' },
  { id: 'sports', name: 'Sports', color: '#FF3B30' },
  { id: 'tech', name: 'Tech', color: '#5AC8FA' },
  { id: 'outdoor', name: 'Outdoor', color: '#30D158' },
  { id: 'social', name: 'Social', color: '#FF6B6B' },
  { id: 'wellness', name: 'Wellness', color: '#007AFF' },
];

export default function CreateEventScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    price: '',
    max_attendees: '',
    image_url: '',
  });
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
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
            { text: 'Open Settings', onPress: () => {
              // For iOS, we can't directly open settings, but we can show instructions
              Alert.alert(
                'Enable Photo Access', 
                'Go to Settings > Privacy & Security > Photos > [Your App Name] and allow access.'
              );
            }}
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
            { text: 'Open Settings', onPress: () => {
              Alert.alert(
                'Enable Camera Access', 
                'Go to Settings > Privacy & Security > Camera > [Your App Name] and allow access.'
              );
            }}
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
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(eventDate);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setEventDate(newDate);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (eventDate <= new Date()) {
      Alert.alert('Error', 'Please select a future date and time');
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
          const uploadResult = await apiClient.uploadImage(selectedImage);
          imageUrl = uploadResult.url;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Show specific error message but continue with event creation
          Alert.alert(
            'Image Upload Warning', 
            `Image upload failed: ${uploadError.message || 'Unknown error'}. The event will be created without an image.`,
            [{ text: 'Continue', style: 'default' }]
          );
        }
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category,
        price: formData.price.trim() || undefined,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
        image_url: imageUrl,
        event_date: eventDate.toISOString(),
      };

      console.log('Creating event with data:', eventData);
      await apiClient.createEvent(eventData);
      
      Alert.alert(
        'Success!', 
        imageUrl ? 'Your event has been created successfully with image!' : 'Your event has been created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert(
        'Event Creation Failed', 
        error.message || 'Failed to create event. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="#1C1C1E" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Image</Text>
          <TouchableOpacity onPress={showImagePicker} style={styles.imageUpload}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color="#8E8E93" size={32} strokeWidth={2} />
                <Text style={styles.imagePlaceholderText}>Add Event Photo</Text>
                <Text style={styles.imagePlaceholderSubtext}>Tap to select from library or take photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Type color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Event title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <FileText color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Event description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
            <View style={styles.inputIcon}>
              <Calendar color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <Text style={styles.dateTimeText}>{formatDate(eventDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
            <View style={styles.inputIcon}>
              <Clock color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <Text style={styles.dateTimeText}>{formatTime(eventDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoriesGrid}>
            {eventCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategorySelect(category.id)}
                style={[
                  styles.categoryChip,
                  formData.category === category.id && [
                    styles.selectedCategoryChip,
                    { backgroundColor: category.color }
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    formData.category === category.id && styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Options</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <DollarSign color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Price (leave empty for free)"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Users color="#8E8E93" size={20} strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Max attendees (optional)"
              value={formData.max_attendees}
              onChangeText={(value) => handleInputChange('max_attendees', value)}
              keyboardType="numeric"
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
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  dateTimeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedCategoryChip: {
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
});