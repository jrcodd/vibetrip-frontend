import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing?: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
}

export default function FollowButton({
    userId,
    initialIsFollowing = false,
    onFollow,
    onUnfollow
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if already following when component mounts
        if (initialIsFollowing === undefined) {
            checkFollowStatus();
        }
    }, [userId]);

    const checkFollowStatus = async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            if (!session?.session) return;

            const { data, error } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', session.session.user.id)
                .eq('following_id', userId)
                .single();

            setIsFollowing(!!data);
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const toggleFollow = async () => {
        try {
            setIsLoading(true);
            const { data: session } = await supabase.auth.getSession();
            if (!session?.session) return;

            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', session.session.user.id)
                    .eq('following_id', userId);

                if (error) throw error;
                setIsFollowing(false);
                onUnfollow?.();
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: session.session.user.id,
                        following_id: userId,
                    });

                if (error) throw error;
                setIsFollowing(true);
                onFollow?.();
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isFollowing ? styles.followingButton : styles.followButton,
                isLoading && styles.disabledButton
            ]}
            onPress={toggleFollow}
            disabled={isLoading}
        >
            <Text style={isFollowing ? styles.followingText : styles.followText}>
                {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followButton: {
        backgroundColor: '#3897f0',
    },
    followingButton: {
        backgroundColor: '#efefef',
        borderWidth: 1,
        borderColor: '#dbdbdb',
    },
    disabledButton: {
        opacity: 0.5,
    },
    followText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    followingText: {
        color: '#262626',
        fontWeight: 'bold',
    },
});

