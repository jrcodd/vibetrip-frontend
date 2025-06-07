import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, Code, Smartphone } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Rocket size={48} color="#FFFFFF" />
          <Text style={styles.title}>Expo + Python</Text>
          <Text style={styles.subtitle}>Full-stack development made simple</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Smartphone size={32} color="#3B82F6" />
          <Text style={styles.cardTitle}>React Native Frontend</Text>
          <Text style={styles.cardDescription}>
            Cross-platform mobile app built with Expo and React Native
          </Text>
        </View>

        <View style={styles.card}>
          <Code size={32} color="#059669" />
          <Text style={styles.cardTitle}>Python Backend</Text>
          <Text style={styles.cardDescription}>
            Lightweight HTTP server using Python's standard library
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Getting Started</Text>
          <Text style={styles.infoText}>
            1. Start the Python backend server{'\n'}
            2. Test API endpoints in the API Test tab{'\n'}
            3. Build your app features
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#F3F4F6',
    padding: 24,
    borderRadius: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});