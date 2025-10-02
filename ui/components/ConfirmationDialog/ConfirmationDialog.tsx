import React, { useEffect, useRef } from 'react';
import { Modal, View, TouchableOpacity, Animated, Platform, Vibration, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export interface ConfirmationDialogProps {
    visible: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'default' | 'destructive' | 'warning';
    icon?: React.ReactNode;
}

export default function ConfirmationDialog({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'default',
    icon,
}: ConfirmationDialogProps) {
    const colorScheme = useColorScheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Add haptic feedback
            if (Platform.OS === 'ios') {
                switch (type) {
                    case 'destructive':
                        Vibration.vibrate([100, 50, 100]);
                        break;
                    case 'warning':
                        Vibration.vibrate([50, 50]);
                        break;
                    default:
                        Vibration.vibrate(50);
                        break;
                }
            }

            // Animate in
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getDefaultIcon = () => {
        switch (type) {
            case 'destructive':
                return <FontAwesome name="exclamation-triangle" size={32} color="#ff4444" />;
            case 'warning':
                return <FontAwesome name="exclamation-circle" size={32} color="#ff9800" />;
            default:
                return <FontAwesome name="info-circle" size={32} color="#007AFF" />;
        }
    };

    const getConfirmButtonColor = () => {
        switch (type) {
            case 'destructive':
                return '#ff4444';
            case 'warning':
                return '#ff9800';
            default:
                return '#007AFF';
        }
    };

    const handleConfirm = () => {
        // Add haptic feedback for confirmation
        if (Platform.OS === 'ios') {
            Vibration.vibrate(50);
        }
        onConfirm();
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        dialogContainer: {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
        },
        dialog: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 320,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                },
                android: {
                    elevation: 12,
                },
            }),
        },
        iconContainer: {
            alignItems: 'center',
            marginBottom: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 8,
            color: Colors[colorScheme ?? 'light'].text,
        },
        message: {
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 24,
            color: Colors[colorScheme ?? 'light'].text,
            opacity: 0.8,
        },
        buttonContainer: {
            flexDirection: 'row',
            gap: 12,
        },
        button: {
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
        },
        confirmButton: {
            backgroundColor: getConfirmButtonColor(),
        },
        cancelText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text,
        },
        confirmText: {
            fontSize: 16,
            fontWeight: '600',
            color: 'white',
        },
    });

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.dialogContainer]}>
                    <View style={styles.dialog}>
                        {(icon || type !== 'default') && (
                            <View style={styles.iconContainer}>
                                {icon || getDefaultIcon()}
                            </View>
                        )}

                        <Text style={styles.title}>{title}</Text>

                        {message && (
                            <Text style={styles.message}>{message}</Text>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleConfirm}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}