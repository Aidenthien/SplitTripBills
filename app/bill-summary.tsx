import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { Trip, Bill, PaymentSummary } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BillShareButton } from '@/ui/components';
import { StorageManager } from '@/utils/StorageManager';

export default function BillSummaryScreen() {
    const { tripId, billId } = useLocalSearchParams<{ tripId: string; billId: string }>();
    const navigation = useNavigation();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [bill, setBill] = useState<Bill | null>(null);
    const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
    const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
    const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
    const colorScheme = useColorScheme();

    useEffect(() => {
        loadData();
    }, [tripId, billId]);

    // Configure header with share icon
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <BillShareButton
                    trip={trip}
                    bill={bill}
                    paymentSummary={paymentSummary}
                />
            ),
        });
    }, [navigation, bill, trip, paymentSummary]);

    const loadData = async () => {
        try {
            const trips = await StorageManager.loadTrips();
            const foundTrip = trips.find(t => t.id === tripId);
            if (foundTrip) {
                setTrip(foundTrip);
                const foundBill = foundTrip.bills.find(b => b.id === billId);
                if (foundBill) {
                    // Parse date strings back to Date objects
                    foundBill.createdAt = new Date(foundBill.createdAt);

                    // Parse dates in receipt photos
                    if (foundBill.receiptPhotos && Array.isArray(foundBill.receiptPhotos)) {
                        foundBill.receiptPhotos = foundBill.receiptPhotos.map(photo => ({
                            ...photo,
                            uploadedAt: new Date(photo.uploadedAt)
                        }));
                        console.log('Loaded bill with photos:', {
                            billId: foundBill.id,
                            photoCount: foundBill.receiptPhotos.length,
                            photoUris: foundBill.receiptPhotos.map(p => p.uri)
                        });
                    }

                    setBill(foundBill);
                    calculatePaymentSummary(foundTrip, foundBill);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const calculatePaymentSummary = (trip: Trip, bill: Bill) => {
        const payer = trip.travelers.find(t => t.id === bill.payerId);
        const payerName = payer?.name || 'Unknown';

        const summary: PaymentSummary[] = bill.splits
            .filter(split => split.travelerId !== bill.payerId) // Exclude the payer
            .map(split => {
                const traveler = trip.travelers.find(t => t.id === split.travelerId);
                return {
                    travelerId: split.travelerId,
                    travelerName: traveler?.name || 'Unknown',
                    totalOwed: split.amount,
                    totalOwedMYR: split.amountMYR,
                    owesTo: bill.payerId,
                    owesToName: payerName,
                };
            });

        setPaymentSummary(summary);
    };

    const goBackToDashboard = () => {
        // Navigate directly back to dashboard with the current tripId
        router.replace({
            pathname: '/trip-dashboard',
            params: { tripId }
        });
    };

    const openPhotoModal = (photoUri: string) => {
        setSelectedPhotoUri(photoUri);
        setIsPhotoModalVisible(true);
    };

    const closePhotoModal = () => {
        setIsPhotoModalVisible(false);
        setSelectedPhotoUri(null);
    };

    if (!trip || !bill) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const payer = trip.travelers.find(t => t.id === bill.payerId);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Bill Header */}
                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={styles.billHeader}>
                            <View style={[styles.categoryIcon, { backgroundColor: bill.category.color + '20' }]}>
                                <FontAwesome name={bill.category.icon as any} size={20} color={bill.category.color} />
                            </View>
                            <View style={styles.billTitleContainer}>
                                <Text style={styles.billTitle}>{bill.description}</Text>
                                <Text style={styles.billCategoryText}>{bill.category.name}</Text>
                            </View>
                        </View>
                        <Text style={styles.billDate}>
                            {new Date(bill.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>

                    {/* Receipt Photos */}
                    {bill.receiptPhotos && bill.receiptPhotos.length > 0 && (
                        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                            <View style={styles.sectionHeaderWithIcon}>
                                <FontAwesome name="camera" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Receipt Photos ({bill.receiptPhotos.length})</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Tap to view full size</Text>

                            <View style={styles.receiptPhotosGrid}>
                                {bill.receiptPhotos.map((photo, index) => {
                                    // Debug log to check URI format
                                    console.log(`Photo ${index + 1} URI:`, photo.uri.substring(0, 100));
                                    console.log(`Photo ${index + 1} starts with:`, {
                                        'data:': photo.uri.startsWith('data:'),
                                        'file://': photo.uri.startsWith('file://'),
                                        'http': photo.uri.startsWith('http'),
                                    });

                                    return (
                                        <TouchableOpacity
                                            key={photo.id}
                                            style={{
                                                width: '48%',
                                                marginBottom: 16,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 8,
                                                overflow: 'hidden'
                                            }}
                                            onPress={() => openPhotoModal(photo.uri)}
                                            activeOpacity={0.7}
                                        >
                                            {/* Simple, reliable image display */}
                                            <Image
                                                source={{ uri: photo.uri }}
                                                style={{
                                                    width: '100%',
                                                    height: 120,
                                                    backgroundColor: '#ddd'
                                                }}
                                                resizeMode="cover"
                                                onLoad={() => {
                                                    console.log(`✅ Simple image ${index + 1} loaded and should be visible`);
                                                }}
                                                onError={(e) => {
                                                    console.log(`❌ Simple image ${index + 1} failed:`, e.nativeEvent.error);
                                                }}
                                            />

                                            {/* Simple overlay with photo number */}
                                            <View style={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                backgroundColor: 'rgba(0, 122, 255, 0.9)',
                                                borderRadius: 12,
                                                width: 24,
                                                height: 24,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                                    {index + 1}
                                                </Text>
                                            </View>

                                            {/* Photo timestamp */}
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                borderRadius: 4,
                                                paddingHorizontal: 6,
                                                paddingVertical: 2
                                            }}>
                                                <Text style={{ color: 'white', fontSize: 10 }}>
                                                    {new Date(photo.uploadedAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Bill Summary */}
                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Bill Summary</Text>

                        {/* Base Amount */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Base Amount:</Text>
                            <Text style={styles.summaryValue}>
                                {trip.targetCurrency.symbol}{(bill.totalAmount - (bill.additionalCharges || 0)).toFixed(2)} {trip.targetCurrency.code}
                            </Text>
                        </View>

                        {/* Additional Charges */}
                        {bill.additionalCharges && bill.additionalCharges > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Additional Charges:</Text>
                                <Text style={styles.summaryValue}>
                                    {trip.targetCurrency.symbol}{bill.additionalCharges.toFixed(2)} {trip.targetCurrency.code}
                                </Text>
                            </View>
                        )}

                        {/* Total Amount */}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total Amount:</Text>
                            <Text style={[styles.summaryValue, styles.totalValue]}>
                                {trip.targetCurrency.symbol}{bill.totalAmount.toFixed(2)} {trip.targetCurrency.code}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount (MYR):</Text>
                            <Text style={styles.summaryValue}>
                                RM {(bill.totalAmount / trip.exchangeRate).toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Paid by:</Text>
                            <Text style={styles.summaryValue}>{payer?.name}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Exchange Rate:</Text>
                            <Text style={styles.summaryValue}>
                                1 {trip.baseCurrency.code} = {trip.exchangeRate} {trip.targetCurrency.code}
                            </Text>
                        </View>
                    </View>

                    {/* Individual Splits */}
                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Individual Splits</Text>

                        {bill.splits.map((split) => {
                            const traveler = trip.travelers.find(t => t.id === split.travelerId);
                            const isPayer = split.travelerId === bill.payerId;

                            return (
                                <View key={split.travelerId} style={styles.splitRow}>
                                    <View style={styles.travelerInfo}>
                                        <Text style={styles.travelerName}>
                                            {traveler?.name} {isPayer && '(Payer)'}
                                        </Text>
                                        <Text style={styles.splitAmount}>
                                            {trip.targetCurrency.symbol}{split.amount.toFixed(2)} {trip.targetCurrency.code}
                                        </Text>
                                        <Text style={styles.splitAmountMYR}>
                                            ≈ RM {split.amountMYR.toFixed(2)}
                                        </Text>
                                    </View>
                                    {isPayer && (
                                        <View style={styles.payerBadge}>
                                            <Text style={styles.payerBadgeText}>PAID</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Payment Summary */}
                    {paymentSummary.length > 0 && (
                        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                            <View style={styles.sectionHeaderWithIcon}>
                                <FontAwesome name="exchange" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Payment Summary</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Bill Details</Text>

                            {paymentSummary.map((payment, index) => (
                                <View key={payment.travelerId} style={[
                                    styles.paymentCard,
                                    {
                                        backgroundColor: Colors[colorScheme ?? 'light'].card,
                                        shadowColor: Colors[colorScheme ?? 'light'].text,
                                        borderLeftColor: Colors[colorScheme ?? 'light'].primary,
                                    }
                                ]}>
                                    <View style={styles.paymentHeader}>
                                        <View style={styles.debtorSection}>
                                            <View style={[
                                                styles.personIcon,
                                                {
                                                    backgroundColor: '#FF6B6B20',
                                                    shadowColor: Colors[colorScheme ?? 'light'].text,
                                                }
                                            ]}>
                                                <FontAwesome name="user" size={16} color="#FF6B6B" />
                                            </View>
                                            <Text style={[styles.debtorName, { color: Colors[colorScheme ?? 'light'].text }]}>
                                                {payment.travelerName}
                                            </Text>
                                        </View>

                                        <View style={styles.arrowSection}>
                                            <FontAwesome name="long-arrow-right" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                                            <Text style={[styles.owesText, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>owes</Text>
                                        </View>

                                        <View style={styles.creditorSection}>
                                            <View style={[
                                                styles.personIcon,
                                                {
                                                    backgroundColor: '#4CAF5020',
                                                    shadowColor: Colors[colorScheme ?? 'light'].text,
                                                }
                                            ]}>
                                                <FontAwesome name="user" size={16} color="#4CAF50" />
                                            </View>
                                            <Text style={[styles.creditorName, { color: Colors[colorScheme ?? 'light'].text }]}>
                                                {payment.owesToName}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[
                                        styles.amountSection,
                                        {
                                            backgroundColor: Colors[colorScheme ?? 'light'].surface,
                                            borderColor: Colors[colorScheme ?? 'light'].text + '20',
                                        }
                                    ]}>
                                        <View style={styles.primaryAmount}>
                                            <FontAwesome name="money" size={16} color="#FF9500" />
                                            <Text style={[styles.paymentAmount, { color: Colors[colorScheme ?? 'light'].text }]}>
                                                {trip.targetCurrency.symbol}{payment.totalOwed.toFixed(2)} {trip.targetCurrency.code}
                                            </Text>
                                        </View>
                                        <View style={styles.convertedAmount}>
                                            <FontAwesome name="exchange" size={12} color={Colors[colorScheme ?? 'light'].text + '60'} />
                                            <Text style={[styles.paymentAmountMYR, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                                RM {payment.totalOwedMYR.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Simple Photo Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isPhotoModalVisible}
                onRequestClose={closePhotoModal}
                statusBarTranslucent={true}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 50,
                            right: 20,
                            zIndex: 1000,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: 20,
                            padding: 10
                        }}
                        onPress={closePhotoModal}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="times" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Simple full-size image */}
                    {selectedPhotoUri && (
                        <Image
                            source={{ uri: selectedPhotoUri }}
                            style={{
                                width: '95%',
                                height: '80%',
                                backgroundColor: 'transparent' // Remove grey background
                            }}
                            resizeMode="contain" // Keeps full image visible without cropping
                            onLoad={() => {
                                console.log('✅ Modal image loaded and should be visible');
                            }}
                            onError={(e) => {
                                console.log('❌ Modal image failed:', e.nativeEvent.error);
                            }}
                        />
                    )}

                    {/* Background touchable to close */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: -1
                        }}
                        onPress={closePhotoModal}
                        activeOpacity={1}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 50,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    billHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    billTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billTitleContainer: {
        flex: 1,
    },
    billCategoryText: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    billDate: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    sectionHeaderWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        marginLeft: 28,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007AFF',
    },
    splitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    travelerInfo: {
        flex: 1,
    },
    travelerName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    splitAmount: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    splitAmountMYR: {
        fontSize: 12,
        color: '#666',
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
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentText: {
        fontSize: 16,
        marginBottom: 4,
    },
    paymentName: {
        fontWeight: 'bold',
    },
    paymentAmounts: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    paymentAmountMYR: {
        fontSize: 14,
        marginLeft: 8,
    },
    paymentStatus: {
        marginLeft: 12,
    },
    // New enhanced payment card styles
    paymentCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    debtorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    creditorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    arrowSection: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    personIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        elevation: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
    },
    debtorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    creditorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    owesText: {
        fontSize: 12,
        marginTop: 2,
        fontStyle: 'italic',
    },
    amountSection: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    primaryAmount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    convertedAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    markPaidButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    markPaidText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    reminderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1,
        justifyContent: 'center',
    },
    reminderText: {
        color: '#007AFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    actions: {
        marginTop: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Receipt Photos Styles
    photosContainer: {
        marginTop: 12,
    },

    photosContent: {
        paddingHorizontal: 4,
    },

    photoThumbnailContainer: {
        marginRight: 12,
        position: 'relative',
    },

    receiptThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },

    photoNumber: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        textAlign: 'center',
    },

    // Simple Receipt Photos Grid
    receiptPhotosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 12,
    },
});