import React, { useEffect, useRef } from 'react';
import { Modal, View, TouchableOpacity, Animated, Platform, Vibration, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export interface PhotoOptionsDialogProps {
    visible: boolean;
    title?: string;
    subtitle?: string;
    onCamera: () => void;
    onGallery: () => void;
    onCancel: () => void;
}

export default function PhotoOptionsDialog({
    visible,
    title = 'Add Receipt Photo',
    subtitle = 'Choose how you want to add a receipt photo',
    onCamera,
    onGallery,
    onCancel,
}: PhotoOptionsDialogProps) {
    const colorScheme = useColorScheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Add haptic feedback
            if (Platform.OS === 'ios') {
                Vibration.vibrate(50);
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

    const handleOptionPress = (action: () => void) => {
        // Add haptic feedback
        if (Platform.OS === 'ios') {
            Vibration.vibrate(25);
        }
        action();
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
            borderRadius: 20,
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
            marginBottom: 20,
        },
        cameraIcon: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#007AFF',
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 8,
            color: Colors[colorScheme ?? 'light'].text,
        },
        subtitle: {
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 28,
            color: Colors[colorScheme ?? 'light'].text,
            opacity: 0.7,
        },
        optionsContainer: {
            gap: 12,
            marginBottom: 20,
        },
        optionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 14,
            backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                },
                android: {
                    elevation: 2,
                },
            }),
        },
        optionIcon: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        cameraOptionIcon: {
            backgroundColor: '#007AFF',
        },
        galleryOptionIcon: {
            backgroundColor: '#34C759',
        },
        optionContent: {
            flex: 1,
        },
        optionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 2,
        },
        optionDescription: {
            fontSize: 13,
            color: Colors[colorScheme ?? 'light'].text,
            opacity: 0.6,
        },
        chevronIcon: {
            opacity: 0.4,
        },
        cancelButton: {
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
        },
        cancelText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text,
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
                        <View style={styles.iconContainer}>
                            <View style={styles.cameraIcon}>
                                <FontAwesome name="camera" size={24} color="white" />
                            </View>
                        </View>

                        <Text style={styles.title}>{title}</Text>

                        {subtitle && (
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        )}

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => handleOptionPress(onCamera)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.optionIcon, styles.cameraOptionIcon]}>
                                    <FontAwesome name="camera" size={20} color="white" />
                                </View>
                                <View style={styles.optionContent}>
                                    <Text style={styles.optionTitle}>Take Photo</Text>
                                    <Text style={styles.optionDescription}>Use camera to capture receipt</Text>
                                </View>
                                <FontAwesome
                                    name="chevron-right"
                                    size={16}
                                    color={Colors[colorScheme ?? 'light'].text}
                                    style={styles.chevronIcon}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => handleOptionPress(onGallery)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.optionIcon, styles.galleryOptionIcon]}>
                                    <FontAwesome name="photo" size={20} color="white" />
                                </View>
                                <View style={styles.optionContent}>
                                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                                    <Text style={styles.optionDescription}>Select existing photo from gallery</Text>
                                </View>
                                <FontAwesome
                                    name="chevron-right"
                                    size={16}
                                    color={Colors[colorScheme ?? 'light'].text}
                                    style={styles.chevronIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}