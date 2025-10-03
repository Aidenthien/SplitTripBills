import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Text } from '@/components/Themed';
import { ReceiptPhoto } from '@/types';
import { useColorScheme } from '@/components/useColorScheme';
import { useNotification } from '@/components/providers/NotificationProvider';
import { createReceiptPhotoUploadStyles } from './ReceiptPhotoUpload.styles';
import PhotoOptionsDialog from '../PhotoOptionsDialog/PhotoOptionsDialog';

// Note: This component requires expo-image-picker to be installed
// Run: npx expo install expo-image-picker
let ImagePicker: any = null;
try {
    ImagePicker = require('expo-image-picker');
} catch (error) {
    console.warn('expo-image-picker not installed. Photo capture features will be limited.');
}

interface ReceiptPhotoUploadProps {
    photos: ReceiptPhoto[];
    onPhotosChange: (photos: ReceiptPhoto[]) => void;
    maxPhotos?: number;
}

export default function ReceiptPhotoUpload({
    photos,
    onPhotosChange,
    maxPhotos = 3
}: ReceiptPhotoUploadProps) {
    const colorScheme = useColorScheme();
    const styles = createReceiptPhotoUploadStyles(colorScheme ?? 'light');
    const { showError, showSuccess } = useNotification();
    const [isCapturing, setIsCapturing] = useState(false);
    const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);

    const handleImagePickerError = () => {
        showError('Photo capture feature requires expo-image-picker. Please install it first.');
    };

    const processSelectedImage = async (asset: any) => {
        // Create photo object with file URI (don't convert to base64)
        const newPhoto: ReceiptPhoto = {
            id: Date.now().toString(),
            uri: asset.uri, // Use original file URI
            name: `receipt_${Date.now()}.jpg`,
            size: asset.fileSize || 0,
            type: 'image/jpeg',
            uploadedAt: new Date(),
        };

        onPhotosChange([...photos, newPhoto]);
    };

    const takePhoto = async () => {
        if (!ImagePicker) {
            handleImagePickerError();
            return;
        }

        if (photos.length >= maxPhotos) {
            showError(`Maximum ${maxPhotos} photo${maxPhotos > 1 ? 's' : ''} allowed per bill`);
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showError('Camera permission is required to take receipt photos.');
            return;
        }

        setIsCapturing(true);

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                await processSelectedImage(asset);
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            showError('Failed to capture photo');
        } finally {
            setIsCapturing(false);
        }
    };

    const pickFromGallery = async () => {
        if (!ImagePicker) {
            handleImagePickerError();
            return;
        }

        if (photos.length >= maxPhotos) {
            showError(`Maximum ${maxPhotos} photo${maxPhotos > 1 ? 's' : ''} allowed per bill`);
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showError('Gallery permission is required to select receipt photos.');
            return;
        }

        setIsCapturing(true);

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                await processSelectedImage(asset);
            }
        } catch (error) {
            console.error('Error selecting photo from gallery:', error);
            showError('Failed to select photo from gallery');
        } finally {
            setIsCapturing(false);
        }
    };

    const showPhotoOptions = () => {
        setPhotoOptionsVisible(true);
    };

    const hidePhotoOptions = () => {
        setPhotoOptionsVisible(false);
    };

    const handleCameraOption = async () => {
        hidePhotoOptions();
        await takePhoto();
    };

    const handleGalleryOption = async () => {
        hidePhotoOptions();
        await pickFromGallery();
    };

    const removePhoto = (photoId: string) => {
        const updatedPhotos = photos.filter(photo => photo.id !== photoId);
        onPhotosChange(updatedPhotos);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!ImagePicker) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <FontAwesome name="camera" size={20} color="#FF9500" style={styles.headerIcon} />
                    <Text style={styles.headerTitle}>Receipt Photos</Text>
                    <Text style={styles.optionalText}>(Unavailable)</Text>
                </View>
                <Text style={styles.subtitle}>
                    Photo capture requires expo-image-picker. Run: npx expo install expo-image-picker
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FontAwesome name="camera" size={20} color="#007AFF" style={styles.headerIcon} />
                <Text style={styles.headerTitle}>Receipt Photos</Text>
                <Text style={styles.optionalText}>(Optional, but recommended)</Text>
            </View>

            <Text style={styles.subtitle}>
                Capture receipt photos for better expense verification and dispute resolution.
            </Text>

            {photos.length > 0 && (
                <View style={styles.photosGrid}>
                    {photos.map((photo, index) => (
                        <View key={photo.id} style={styles.photoCard}>
                            <View style={styles.photoContainer}>
                                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removePhoto(photo.id)}
                                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                >
                                    <FontAwesome name="times-circle" size={24} color="#FF3B30" />
                                </TouchableOpacity>
                                <View style={styles.photoNumberBadge}>
                                    <Text style={styles.photoNumber}>{index + 1}</Text>
                                </View>
                            </View>
                            <View style={styles.photoMeta}>
                                <Text style={styles.photoSize}>{formatFileSize(photo.size)}</Text>
                                <Text style={styles.photoTime}>
                                    {new Date(photo.uploadedAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.captureButton,
                    isCapturing && styles.capturingButton,
                    photos.length >= maxPhotos && styles.disabledButton
                ]}
                onPress={showPhotoOptions}
                disabled={isCapturing || photos.length >= maxPhotos}
            >
                <View style={styles.captureButtonContent}>
                    <FontAwesome
                        name={isCapturing ? "spinner" : "plus"}
                        size={24}
                        color="white"
                        style={isCapturing ? styles.spinningIcon : undefined}
                    />
                    <Text style={styles.captureButtonText}>
                        {isCapturing ? 'Processing...' :
                            photos.length >= maxPhotos ? `Maximum ${maxPhotos} photo${maxPhotos > 1 ? 's' : ''}` :
                                photos.length === 0 ? 'Add Receipt Photo' : 'Replace Photo'}
                    </Text>
                </View>
                <Text style={styles.captureHint}>
                    {photos.length < maxPhotos ? `${photos.length}/${maxPhotos} photo${maxPhotos > 1 ? 's' : ''} • Camera or Gallery` : 'Limit reached'}
                </Text>
            </TouchableOpacity>

            <PhotoOptionsDialog
                visible={photoOptionsVisible}
                title="Add Receipt Photo"
                subtitle="Choose how you want to add a receipt photo"
                onCamera={handleCameraOption}
                onGallery={handleGalleryOption}
                onCancel={hidePhotoOptions}
            />
        </View>
    );
}