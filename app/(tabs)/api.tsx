import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Send, Server, CheckCircle, XCircle } from 'lucide-react-native';

interface ApiResponse {
  status: string;
  data?: any;
  error?: string;
}

export default function ApiScreen() {
  const [responses, setResponses] = useState<{ [key: string]: ApiResponse }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const makeRequest = async (endpoint: string, method: string = 'GET') => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResponses(prev => ({
        ...prev,
        [endpoint]: { status: 'success', data }
      }));
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [endpoint]: { status: 'error', error: error.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const endpoints = [
    { path: '/api/health', method: 'GET', description: 'Health check' },
    { path: '/api/users', method: 'GET', description: 'Get users' },
    { path: '/api/data', method: 'GET', description: 'Get sample data' },
    { path: '/api/time', method: 'GET', description: 'Get server time' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Server size={32} color="#3B82F6" />
        <Text style={styles.title}>API Testing</Text>
        <Text style={styles.subtitle}>Test your Python backend endpoints</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.serverStatus}>
          <Text style={styles.serverStatusText}>
            Make sure Python server is running on port 8000
          </Text>
          <Text style={styles.serverCommand}>python backend/server.py</Text>
        </View>

        {endpoints.map((endpoint) => (
          <View key={endpoint.path} style={styles.endpointCard}>
            <View style={styles.endpointHeader}>
              <View>
                <Text style={styles.endpointPath}>{endpoint.path}</Text>
                <Text style={styles.endpointDescription}>{endpoint.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, loading[endpoint.path] && styles.testButtonLoading]}
                onPress={() => makeRequest(endpoint.path, endpoint.method)}
                disabled={loading[endpoint.path]}
              >
                {loading[endpoint.path] ? (
                  <Text style={styles.testButtonText}>Testing...</Text>
                ) : (
                  <>
                    <Send size={16} color="#FFFFFF" />
                    <Text style={styles.testButtonText}>Test</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {responses[endpoint.path] && (
              <View style={styles.responseContainer}>
                <View style={styles.responseHeader}>
                  {responses[endpoint.path].status === 'success' ? (
                    <CheckCircle size={16} color="#059669" />
                  ) : (
                    <XCircle size={16} color="#DC2626" />
                  )}
                  <Text style={[
                    styles.responseStatus,
                    responses[endpoint.path].status === 'success' 
                      ? styles.responseSuccess 
                      : styles.responseError
                  ]}>
                    {responses[endpoint.path].status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.responseText}>
                  {JSON.stringify(
                    responses[endpoint.path].data || responses[endpoint.path].error,
                    null,
                    2
                  )}
                </Text>
              </View>
            )}
          </View>
        ))}
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  serverStatus: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  serverStatusText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  serverCommand: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#92400E',
    backgroundColor: '#FDE68A',
    padding: 8,
    borderRadius: 6,
  },
  endpointCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  endpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  endpointPath: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace',
  },
  endpointDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testButtonLoading: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  responseContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  responseStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  responseSuccess: {
    color: '#059669',
  },
  responseError: {
    color: '#DC2626',
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
});