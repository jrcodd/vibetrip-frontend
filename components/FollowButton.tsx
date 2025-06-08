import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { apiClient } from '../lib/api';

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
            const isAuth = await apiClient.isAuthenticated();
            if (!isAuth) return;

            // Note: The API doesn't have a direct endpoint to check follow status
            // This would need to be implemented in the backend or we can check via followers list
            // For now, we'll rely on the initialIsFollowing prop
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const toggleFollow = async () => {
        try {
            setIsLoading(true);
            const isAuth = await apiClient.isAuthenticated();
            if (!isAuth) return;

            // Optimistic update
            const previousFollowingState = isFollowing;
            setIsFollowing(!isFollowing);

            try {
                if (isFollowing) {
                    // Unfollow
                    await apiClient.unfollowUser(userId);
                    onUnfollow?.();
                } else {
                    // Follow
                    await apiClient.followUser(userId);
                    onFollow?.();
                }
            } catch (apiError) {
                // Revert optimistic update on failure
                setIsFollowing(previousFollowingState);
                console.error('Error toggling follow:', apiError);
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

