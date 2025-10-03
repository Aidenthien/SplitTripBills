import * as FileSystem from 'expo-file-system/legacy';
import { ReceiptPhoto } from '@/types';

/**
 * File System Storage for handling large numbers of receipt photos
 * Each bill gets its own folder to organize photos
 */
export class FileSystemStorage {
    private static BASE_DIR = `${FileSystem.documentDirectory}SplitTripBills/`;
    private static RECEIPTS_DIR = `${FileSystemStorage.BASE_DIR}receipts/`;

    /**
     * Ensure base directories exist
     */
    static async ensureDirectories(): Promise<void> {
        try {
            // Create base app directory
            const baseInfo = await FileSystem.getInfoAsync(this.BASE_DIR);
            if (!baseInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.BASE_DIR, { intermediates: true });
            }

            // Create receipts directory
            const receiptsInfo = await FileSystem.getInfoAsync(this.RECEIPTS_DIR);
            if (!receiptsInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.RECEIPTS_DIR, { intermediates: true });
            }
        } catch (error) {
            console.error('Failed to create directories:', error);
        }
    }

    /**
     * Get bill-specific directory path
     */
    static getBillDirectory(billId: string): string {
        return `${this.RECEIPTS_DIR}bill_${billId}/`;
    }

    /**
     * Save receipt photo to file system
     * Each bill gets its own folder: /receipts/bill_123456/photo_1.jpg
     */
    static async saveReceiptPhoto(
        billId: string,
        sourceUri: string,
        photoIndex: number = 0
    ): Promise<ReceiptPhoto> {
        await this.ensureDirectories();

        const billDir = this.getBillDirectory(billId);

        // Create bill-specific directory
        const billDirInfo = await FileSystem.getInfoAsync(billDir);
        if (!billDirInfo.exists) {
            await FileSystem.makeDirectoryAsync(billDir, { intermediates: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `photo_${photoIndex}_${timestamp}.jpg`;
        const targetPath = `${billDir}${filename}`;

        try {
            // Handle different URI formats
            let processedUri = sourceUri;

            // If it's already a base64 string, we need to save it as a file
            if (sourceUri.startsWith('data:image/')) {
                console.log('Processing base64 image...');

                // Extract base64 data
                const base64Data = sourceUri.split(',')[1];

                // Write base64 data directly to file
                await FileSystem.writeAsStringAsync(targetPath, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                console.log('Successfully saved base64 image to:', targetPath);
            } else {
                // Handle file URI (from camera/gallery)
                console.log('Processing file URI:', sourceUri);

                // Clean up the URI - remove file:// prefix if present for Android compatibility
                if (sourceUri.startsWith('file://')) {
                    processedUri = sourceUri;
                } else if (!sourceUri.startsWith('/')) {
                    // If it doesn't start with / or file://, it might be a content URI
                    processedUri = sourceUri;
                }

                // Try to copy the file
                try {
                    await FileSystem.copyAsync({
                        from: processedUri,
                        to: targetPath
                    });
                    console.log('Successfully copied file to:', targetPath);
                } catch (copyError) {
                    console.log('Copy failed, trying to read and write:', copyError);

                    // If copy fails, try to read the file and write it
                    const fileData = await FileSystem.readAsStringAsync(processedUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    await FileSystem.writeAsStringAsync(targetPath, fileData, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    console.log('Successfully read and wrote file to:', targetPath);
                }
            }

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(targetPath);
            const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

            return {
                id: timestamp.toString(),
                uri: targetPath, // Store file path instead of base64
                name: filename,
                size: fileSize,
                type: 'image/jpeg',
                uploadedAt: new Date(),
            };
        } catch (error) {
            console.error('Failed to save receipt photo:', error);
            console.error('Source URI:', sourceUri);
            console.error('Target path:', targetPath);
            throw new Error(`Failed to save photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Load all receipt photos for a bill
     */
    static async loadReceiptPhotos(billId: string): Promise<ReceiptPhoto[]> {
        try {
            const billDir = this.getBillDirectory(billId);

            // Check if bill directory exists
            const billDirInfo = await FileSystem.getInfoAsync(billDir);
            if (!billDirInfo.exists) {
                return [];
            }

            // Read all files in bill directory
            const files = await FileSystem.readDirectoryAsync(billDir);
            const photos: ReceiptPhoto[] = [];

            for (const filename of files) {
                if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
                    const filePath = `${billDir}${filename}`;
                    const fileInfo = await FileSystem.getInfoAsync(filePath);

                    if (fileInfo.exists) {
                        const fileSize = 'size' in fileInfo ? fileInfo.size : 0;

                        // Extract timestamp from filename
                        const timestampMatch = filename.match(/_(\d+)\.jpg$/);
                        const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : Date.now();

                        photos.push({
                            id: timestamp.toString(),
                            uri: filePath,
                            name: filename,
                            size: fileSize,
                            type: 'image/jpeg',
                            uploadedAt: new Date(timestamp),
                        });
                    }
                }
            }

            // Sort by upload date (newest first)
            return photos.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
        } catch (error) {
            console.error(`Failed to load photos for bill ${billId}:`, error);
            return [];
        }
    }

    /**
     * Delete all photos for a bill
     */
    static async deleteReceiptPhotos(billId: string): Promise<void> {
        try {
            const billDir = this.getBillDirectory(billId);

            const billDirInfo = await FileSystem.getInfoAsync(billDir);
            if (billDirInfo.exists) {
                await FileSystem.deleteAsync(billDir, { idempotent: true });
                console.log(`Deleted photos for bill ${billId}`);
            }
        } catch (error) {
            console.error(`Failed to delete photos for bill ${billId}:`, error);
        }
    }

    /**
     * Delete a specific photo
     */
    static async deletePhoto(photo: ReceiptPhoto): Promise<void> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(photo.uri);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(photo.uri);
                console.log(`Deleted photo: ${photo.name}`);
            }
        } catch (error) {
            console.error(`Failed to delete photo ${photo.name}:`, error);
        }
    }

    /**
     * Get storage statistics
     */
    static async getStorageStats(): Promise<{
        totalBills: number;
        totalPhotos: number;
        totalSizeMB: number;
        billsWithPhotoDetails: Array<{ billId: string; photoCount: number; sizeMB: number }>;
    }> {
        try {
            await this.ensureDirectories();

            const receiptsInfo = await FileSystem.getInfoAsync(this.RECEIPTS_DIR);
            if (!receiptsInfo.exists) {
                return { totalBills: 0, totalPhotos: 0, totalSizeMB: 0, billsWithPhotoDetails: [] };
            }

            const billDirs = await FileSystem.readDirectoryAsync(this.RECEIPTS_DIR);
            const billsWithPhotoDetails: Array<{ billId: string; photoCount: number; sizeMB: number }> = [];

            let totalPhotos = 0;
            let totalSize = 0;

            for (const billDir of billDirs) {
                if (billDir.startsWith('bill_')) {
                    const billId = billDir.replace('bill_', '');
                    const billDirPath = `${this.RECEIPTS_DIR}${billDir}/`;

                    try {
                        const files = await FileSystem.readDirectoryAsync(billDirPath);
                        const photoFiles = files.filter(f =>
                            f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg')
                        );

                        let billSize = 0;
                        for (const file of photoFiles) {
                            const fileInfo = await FileSystem.getInfoAsync(`${billDirPath}${file}`);
                            if (fileInfo.exists && 'size' in fileInfo) {
                                billSize += fileInfo.size;
                            }
                        }

                        totalPhotos += photoFiles.length;
                        totalSize += billSize;

                        if (photoFiles.length > 0) {
                            billsWithPhotoDetails.push({
                                billId,
                                photoCount: photoFiles.length,
                                sizeMB: Math.round((billSize / (1024 * 1024)) * 100) / 100
                            });
                        }
                    } catch (error) {
                        console.warn(`Failed to read bill directory ${billDir}:`, error);
                    }
                }
            }

            return {
                totalBills: billsWithPhotoDetails.length,
                totalPhotos,
                totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
                billsWithPhotoDetails: billsWithPhotoDetails.sort((a, b) => b.sizeMB - a.sizeMB)
            };
        } catch (error) {
            console.error('Failed to get storage stats:', error);
            return { totalBills: 0, totalPhotos: 0, totalSizeMB: 0, billsWithPhotoDetails: [] };
        }
    }

    /**
     * Clean up orphaned photo directories (bills that no longer exist)
     */
    static async cleanupOrphanedPhotos(activeBillIds: string[]): Promise<number> {
        try {
            const receiptsInfo = await FileSystem.getInfoAsync(this.RECEIPTS_DIR);
            if (!receiptsInfo.exists) {
                return 0;
            }

            const billDirs = await FileSystem.readDirectoryAsync(this.RECEIPTS_DIR);
            let cleanedCount = 0;

            for (const billDir of billDirs) {
                if (billDir.startsWith('bill_')) {
                    const billId = billDir.replace('bill_', '');

                    if (!activeBillIds.includes(billId)) {
                        // This bill no longer exists, delete its photos
                        await FileSystem.deleteAsync(`${this.RECEIPTS_DIR}${billDir}`, { idempotent: true });
                        cleanedCount++;
                        console.log(`Cleaned up orphaned photos for bill: ${billId}`);
                    }
                }
            }

            return cleanedCount;
        } catch (error) {
            console.error('Failed to cleanup orphaned photos:', error);
            return 0;
        }
    }
}