import React, { useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { Icon } from '@/ui/components/Icon';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { NotificationData, NotificationType } from '@/components/providers/NotificationProvider';
import { createToastStyles } from './Toast.styles';

const { width: screenWidth } = Dimensions.get('window');

interface ToastProps {
    notification: NotificationData;
    onDismiss: (id: string) => void;
}

const getToastIcon = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return 'success';
        case 'error':
            return 'error';
        case 'warning':
            return 'warning';
        case 'info':
            return 'info';
        default:
            return 'info';
    }
};

export default function Toast({ notification, onDismiss }: ToastProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createToastStyles(theme);
    const insets = useSafeAreaInsets();

    // Native-style animations: slide from top with spring effect
    const translateY = useRef(new Animated.Value(-200)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    const progressWidth = useRef(new Animated.Value(1)).current; // Progress bar animation

    const TOAST_DURATION = 3500; // 3.5 seconds

    useEffect(() => {
        // Native haptic feedback
        if (Platform.OS === 'ios') {
            switch (notification.type) {
                case 'success':
                    Vibration.vibrate([50]); // Light vibration for success
                    break;
                case 'error':
                    Vibration.vibrate([100, 50, 100]); // Double vibration for error
                    break;
                case 'warning':
                    Vibration.vibrate([80]); // Medium vibration for warning
                    break;
                default:
                    break;
            }
        }

        // Native-style slide-in animation with spring physics
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Start progress bar animation after slide-in completes
        const progressTimer = setTimeout(() => {
            Animated.timing(progressWidth, {
                toValue: 0,
                duration: TOAST_DURATION,
                useNativeDriver: false, // width animation requires useNativeDriver: false
            }).start();
        }, 300); // Start after slide-in animation

        // Auto-dismiss timer (if no actions)
        if (!notification.actions || notification.actions.length === 0) {
            const dismissTimer = setTimeout(() => {
                handleDismiss();
            }, TOAST_DURATION + 300); // Add slide-in delay

            return () => {
                clearTimeout(progressTimer);
                clearTimeout(dismissTimer);
            };
        }

        return () => clearTimeout(progressTimer);
    }, []);

    const handleDismiss = () => {
        // Native-style slide-out animation
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: -200,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss(notification.id);
        });
    };

    const getToastStyle = () => {
        switch (notification.type) {
            case 'success':
                return styles.success;
            case 'error':
                return styles.error;
            case 'warning':
                return styles.warning;
            case 'info':
                return styles.info;
            default:
                return styles.info;
        }
    };

    const getIconContainerStyle = () => {
        switch (notification.type) {
            case 'success':
                return styles.successIcon;
            case 'error':
                return styles.errorIcon;
            case 'warning':
                return styles.warningIcon;
            case 'info':
                return styles.infoIcon;
            default:
                return styles.infoIcon;
        }
    };

    const getIconColor = () => {
        // Use vibrant colors that match the notification type for better visibility
        switch (notification.type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            case 'info':
                return theme.colors.info;
            default:
                return theme.colors.primary;
        }
    };

    const getProgressBarColor = () => {
        switch (notification.type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            case 'info':
                return theme.colors.info;
            default:
                return theme.colors.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                getToastStyle(),
                {
                    transform: [
                        { translateY: translateY },
                        { scale: scale }
                    ],
                    opacity: opacity,
                    top: insets.top + 10, // Native-style positioning from top
                },
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, getIconContainerStyle()]}>
                    <Icon
                        name={getToastIcon(notification.type)}
                        size={22}
                        color={getIconColor()}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{notification.title}</Text>
                    {notification.message && (
                        <Text style={styles.message}>{notification.message}</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name="close" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {notification.actions && notification.actions.length > 0 && (
                <View style={styles.actions}>
                    {notification.actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.actionButton,
                                action.style === 'destructive' && styles.destructiveAction,
                            ]}
                            onPress={() => {
                                action.onPress();
                                handleDismiss();
                            }}
                        >
                            <Text
                                style={[
                                    styles.actionText,
                                    action.style === 'destructive' && styles.destructiveActionText,
                                ]}
                            >
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Progress Bar */}
            {(!notification.actions || notification.actions.length === 0) && (
                <View style={styles.progressContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                backgroundColor: getProgressBarColor(),
                                width: progressWidth.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            )}
        </Animated.View>
    );
}