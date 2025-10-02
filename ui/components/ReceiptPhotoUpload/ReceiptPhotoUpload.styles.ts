import { StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';

export const createReceiptPhotoUploadStyles = (colorScheme: 'light' | 'dark' | null) =>
    StyleSheet.create({
        container: {
            marginBottom: 20,
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },

        headerIcon: {
            marginRight: 8,
        },

        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text,
            flex: 1,
        },

        optionalText: {
            fontSize: 12,
            color: '#4CAF50',
            fontWeight: '500',
        },

        subtitle: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].text,
            opacity: 0.8,
            marginBottom: 16,
            lineHeight: 20,
        },

        // Enhanced Grid Layout
        photosGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 16,
            gap: 12,
        },

        photoCard: {
            borderRadius: 12,
            backgroundColor: Colors[colorScheme ?? 'light'].surface || Colors[colorScheme ?? 'light'].background,
            padding: 8,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },

        photoContainer: {
            position: 'relative',
            marginBottom: 8,
        },

        photoThumbnail: {
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: '#f5f5f5',
        },

        removeButton: {
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderRadius: 12,
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 4,
                },
            }),
        },

        photoNumberBadge: {
            position: 'absolute',
            bottom: 4,
            left: 4,
            backgroundColor: 'rgba(0, 122, 255, 0.9)',
            borderRadius: 12,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },

        photoNumber: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },

        photoMeta: {
            alignItems: 'center',
        },

        photoSize: {
            fontSize: 11,
            color: Colors[colorScheme ?? 'light'].text,
            opacity: 0.6,
            fontWeight: '500',
        },

        photoTime: {
            fontSize: 10,
            color: Colors[colorScheme ?? 'light'].text,
            opacity: 0.5,
            marginTop: 2,
        },

        // Enhanced Capture Button
        captureButton: {
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            backgroundColor: '#007AFF',
            marginBottom: 12,
            ...Platform.select({
                ios: {
                    shadowColor: '#007AFF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 6,
                },
            }),
        },

        capturingButton: {
            backgroundColor: '#5AC8FA',
        },

        disabledButton: {
            backgroundColor: Colors[colorScheme ?? 'light'].text + '40',
            ...Platform.select({
                ios: {
                    shadowOpacity: 0,
                },
                android: {
                    elevation: 0,
                },
            }),
        },

        captureButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
        },

        captureButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: 'white',
            marginLeft: 12,
        },

        captureHint: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
        },

        spinningIcon: {
            // Add spinning animation if needed
        },

        // Benefits Section
        benefitsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#E8F5E8',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#4CAF50',
        },

        benefitsText: {
            fontSize: 13,
            color: '#2E7D32',
            marginLeft: 8,
            flex: 1,
            lineHeight: 18,
        },
    });