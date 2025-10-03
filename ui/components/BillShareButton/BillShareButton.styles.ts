import { StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export const createBillShareButtonStyles = (colorScheme: 'light' | 'dark' | null) => {
    return StyleSheet.create({
        // Button Styles
        shareButton: {
            padding: 8,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        disabledButton: {
            opacity: 0.5,
        },
        activeIcon: {
            color: Colors[colorScheme ?? 'light'].tint,
        },
        disabledIcon: {
            color: Colors[colorScheme ?? 'light'].tabIconDefault,
        },

        // Modal Styles - Android Material Design
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.32)', // Material overlay
            justifyContent: 'flex-end', // Bottom sheet style
        },
        modalContainer: {
            width: '100%',
            maxHeight: height * 0.9,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopLeftRadius: 16, // Rounded top corners only
            borderTopRightRadius: 16,
            elevation: 24, // High elevation for modal
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
        },
        dragHandle: {
            width: 32,
            height: 4,
            backgroundColor: Colors[colorScheme ?? 'light'].secondary,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 8,
            marginBottom: 8,
            opacity: 0.4,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme ?? 'light'].border,
            minHeight: 56, // Material Design standard
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '500', // Medium weight for Android
            color: Colors[colorScheme ?? 'light'].text,
            letterSpacing: 0.15,
        },
        closeButton: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        },

        // Share Card Styles - Material Design
        shareCard: {
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        brandHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            paddingVertical: 16,
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            borderRadius: 8,
            elevation: 1,
        },
        appName: {
            fontSize: 18,
            fontWeight: '500',
            marginLeft: 12,
            color: '#007AFF',
            letterSpacing: 0.15,
        },

        // Title Section - Material Design
        titleSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 16,
            paddingVertical: 20,
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
        },
        categoryIconLarge: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            marginRight: 16,
            elevation: 1,
        },
        titleInfo: {
            flex: 1,
        },
        billTitle: {
            fontSize: 20,
            fontWeight: '500',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 4,
            letterSpacing: 0.15,
        },
        billDate: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].secondary,
            marginBottom: 2,
            letterSpacing: 0.25,
        },
        billCategory: {
            fontSize: 12,
            color: Colors[colorScheme ?? 'light'].tint,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },

        // Details Card - Material Design
        detailsCard: {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
            marginBottom: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 16,
            letterSpacing: 0.15,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            minHeight: 48, // Material Design minimum touch target
        },
        detailLabel: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].secondary,
            letterSpacing: 0.25,
        },
        detailValue: {
            fontSize: 14,
            fontWeight: '500',
            color: Colors[colorScheme ?? 'light'].text,
            letterSpacing: 0.25,
        },

        // Split Rows
        splitRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme ?? 'light'].border,
        },
        lastSplitRow: {
            borderBottomWidth: 0,
        },
        travelerInfo: {
            flex: 1,
        },
        travelerName: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 4,
        },
        travelerAmount: {
            fontSize: 14,
            color: '#007AFF',
            fontWeight: '600',
        },
        travelerAmountMYR: {
            fontSize: 12,
            color: Colors[colorScheme ?? 'light'].secondary,
        },
        payerBadge: {
            backgroundColor: '#4CAF50',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
        },
        payerBadgeText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },

        // Payment Summary
        paymentRow: {
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme ?? 'light'].border,
        },
        lastPaymentRow: {
            borderBottomWidth: 0,
        },
        paymentText: {
            fontSize: 16,
            marginBottom: 8,
        },
        debtorName: {
            fontWeight: 'bold',
            color: '#FF6B6B',
        },
        owesText: {
            color: Colors[colorScheme ?? 'light'].secondary,
        },
        creditorName: {
            fontWeight: 'bold',
            color: '#4CAF50',
        },
        paymentAmounts: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        paymentAmount: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FF9500',
        },
        paymentAmountMYR: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].secondary,
        },

        // Photos Grid
        photosGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        photoContainer: {
            position: 'relative',
            width: (width * 0.95 - 64 - 16) / 4, // Responsive width
            aspectRatio: 1,
            borderRadius: 8,
            overflow: 'hidden',
        },
        receiptPhoto: {
            width: '100%',
            height: '100%',
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
        },
        photoNumber: {
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: 'rgba(0, 122, 255, 0.9)',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        photoNumberText: {
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
        },
        morePhotosContainer: {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            justifyContent: 'center',
            alignItems: 'center',
        },
        morePhotosText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: Colors[colorScheme ?? 'light'].tint,
        },
        morePhotosLabel: {
            fontSize: 12,
            color: Colors[colorScheme ?? 'light'].secondary,
        },

        // Footer
        footer: {
            alignItems: 'center',
            paddingVertical: 16,
            marginTop: 20,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
        footerText: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].tint,
            fontWeight: '600',
        },
        footerDate: {
            fontSize: 12,
            color: Colors[colorScheme ?? 'light'].secondary,
            marginTop: 4,
        },

        // Action Buttons - Material Design
        actionButtons: {
            paddingHorizontal: 16,
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme ?? 'light'].border,
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
        },
        shareInstructions: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].secondary,
            textAlign: 'center',
            letterSpacing: 0.25,
            lineHeight: 20,
            marginBottom: 16,
        },
        screenshotButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: Colors[colorScheme ?? 'light'].border,
            elevation: 1,
        },
        screenshotButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: '#007AFF',
            letterSpacing: 0.25,
        },
    });
};