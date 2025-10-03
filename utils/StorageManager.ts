import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, ReceiptPhoto } from '@/types';
import { FileSystemStorage } from './FileSystemStorage';

/**
 * Storage Manager to handle large data storage issues
 * Separates receipt photos from main trip data to prevent "Row too big" errors
 */
export class StorageManager {
    private static TRIPS_KEY = 'trips';
    private static PHOTOS_KEY_PREFIX = 'receipt_photos_';

    /**
     * Save trips without receipt photos
     */
    static async saveTrips(trips: Trip[]): Promise<void> {
        // Remove receipt photos from trips before storing
        const tripsWithoutPhotos = trips.map(trip => ({
            ...trip,
            bills: trip.bills.map(bill => {
                const { receiptPhotos, ...billWithoutPhotos } = bill;
                return billWithoutPhotos;
            })
        }));

        await AsyncStorage.setItem(this.TRIPS_KEY, JSON.stringify(tripsWithoutPhotos));
    }

    /**
     * Load trips and merge with receipt photos from file system
     */
    static async loadTrips(): Promise<Trip[]> {
        const savedTrips = await AsyncStorage.getItem(this.TRIPS_KEY);
        if (!savedTrips) return [];

        const trips: Trip[] = JSON.parse(savedTrips);

        // Load receipt photos from file system for each bill
        for (const trip of trips) {
            for (const bill of trip.bills) {
                const photos = await FileSystemStorage.loadReceiptPhotos(bill.id);
                if (photos.length > 0) {
                    bill.receiptPhotos = photos;
                }
            }
        }

        return trips;
    }

    /**
     * Save receipt photos to file system
     */
    static async saveReceiptPhotos(billId: string, photos: ReceiptPhoto[]): Promise<void> {
        // If no photos, clean up any existing photos for this bill
        if (photos.length === 0) {
            await FileSystemStorage.deleteReceiptPhotos(billId);
            return;
        }

        // For now, we assume photos are already saved by FileSystemStorage.saveReceiptPhoto
        // This method is kept for compatibility but FileSystemStorage handles the actual saving
    }

    /**
     * Load receipt photos for a specific bill from file system
     */
    static async loadReceiptPhotos(billId: string): Promise<ReceiptPhoto[]> {
        return await FileSystemStorage.loadReceiptPhotos(billId);
    }

    /**
     * Delete receipt photos for a bill from file system
     */
    static async deleteReceiptPhotos(billId: string): Promise<void> {
        await FileSystemStorage.deleteReceiptPhotos(billId);
    }

    /**
     * Get comprehensive storage usage information
     */
    static async getStorageInfo(): Promise<{
        tripDataSizeKB: number;
        photoCount: number;
        totalPhotoSizeMB: number;
        billsWithPhotos: number;
    }> {
        let tripDataSize = 0;

        try {
            const tripsData = await AsyncStorage.getItem(this.TRIPS_KEY);
            if (tripsData) {
                tripDataSize = new Blob([tripsData]).size;
            }

            // Get file system storage stats
            const stats = await FileSystemStorage.getStorageStats();

            return {
                tripDataSizeKB: Math.round((tripDataSize / 1024) * 100) / 100,
                photoCount: stats.totalPhotos,
                totalPhotoSizeMB: stats.totalSizeMB,
                billsWithPhotos: stats.totalBills
            };
        } catch (error) {
            console.warn('Failed to calculate storage info:', error);
            return { tripDataSizeKB: 0, photoCount: 0, totalPhotoSizeMB: 0, billsWithPhotos: 0 };
        }
    }

    /**
     * Clean up orphaned photo data using file system cleanup
     */
    static async cleanupOrphanedPhotos(trips: Trip[]): Promise<void> {
        const activeBillIds: string[] = [];

        // Collect all active bill IDs
        trips.forEach(trip => {
            trip.bills.forEach(bill => {
                activeBillIds.push(bill.id);
            });
        });

        // Clean up orphaned photos using file system storage
        const cleanedCount = await FileSystemStorage.cleanupOrphanedPhotos(activeBillIds);

        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} orphaned photo directories`);
        }
    }
}