import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, View, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { subscribeToChannel, Channel, unsubscribeFromChannel } from '../lib/realtime';
import ActivityItem from './ActivityItem';

export default function ActivityFeed() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 15;

    // Load activities
    const loadActivities = useCallback(async (pageNum = 0, refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (pageNum === 0) {
                setLoading(true);
            }

            const { data: session } = await supabase.auth.getSession();
            if (!session?.session) return;

            const userId = session.session.user.id;

            const { data, error } = await supabase
                .from('activities')
                .select(`
          *,
          actor:profiles!activities_actor_id_fkey(*),
          posts(*),
          events(*)
        `)
                .or(`user_id.eq.${userId},actor_id.eq.${userId}`)
                .order('created_at', { ascending: false })
                .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

            if (error) {
                throw error;
            }

            if (refresh || pageNum === 0) {
                setActivities(data || []);
            } else {
                setActivities(prev => [...prev, ...(data || [])]);
            }

            // Check if we have more results
            setHasMore((data || []).length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Subscribe to real-time updates for the activity feed
    useEffect(() => {
        let subscription;

        const setupRealtime = async () => {
            try {
                const { data: session } = await supabase.auth.getSession();
                if (!session?.session) return;

                const userId = session.session.user.id;

                subscription = subscribeToChannel(
                    Channel.ACTIVITIES,
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            // Fetch complete activity with relations
                            fetchActivity(payload.new.id);
                        }
                    },
                    userId
                );
            } catch (error) {
                console.error('Error setting up realtime:', error);
            }
        };

        setupRealtime();
        loadActivities();

        return () => {
            if (subscription) {
                unsubscribeFromChannel(subscription);
            }
        };
    }, [loadActivities]);

    const fetchActivity = async (activityId) => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select(`
          *,
          actor:profiles!activities_actor_id_fkey(*),
          posts(*),
          events(*)
        `)
                .eq('id', activityId)
                .single();

            if (error) throw error;

            if (data) {
                setActivities(prev => [data, ...prev]);
            }
        } catch (error) {
            console.error('Error fetching new activity:', error);
        }
    };

    const handleRefresh = () => {
        loadActivities(0, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadActivities(nextPage);
        }
    };

    if (loading && !refreshing && activities.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3897f0" />
            </View>
        );
    }

    return (
        <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ActivityItem activity={item} />}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No activities yet</Text>
                </View>
            }
            ListFooterComponent={
                loading && activities.length > 0 ? (
                    <View style={styles.footer}>
                        <ActivityIndicator size="small" color="#3897f0" />
                    </View>
                ) : null
            }
        />
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#8e8e8e',
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
