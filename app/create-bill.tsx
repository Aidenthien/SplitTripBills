import {
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect, useLayoutEffect } from 'react';

import { Text, View } from '@/components/Themed';
import { Trip, Bill, BillSplit, BillCategory, ReceiptPhoto, MixedRatePayment } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useNotification } from '@/components/providers/NotificationProvider';
import { CategoryDropdown, ReceiptPhotoUpload } from '@/ui/components';
import { BILL_CATEGORIES, getDefaultCategory } from '@/constants/BillCategories';
import { StorageManager } from '@/utils/StorageManager';
import { FileSystemStorage } from '@/utils/FileSystemStorage';

export default function CreateBillScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const navigation = useNavigation();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<BillCategory>(getDefaultCategory());
    const [receiptPhotos, setReceiptPhotos] = useState<ReceiptPhoto[]>([]);
    const [totalAmount, setTotalAmount] = useState('');
    const [additionalCharges, setAdditionalCharges] = useState('');
    const [payerId, setPayerId] = useState('');
    const [travelerAmounts, setTravelerAmounts] = useState<{ [key: string]: string }>({});
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
    const [showMixedRateModal, setShowMixedRateModal] = useState(false);
    const [useMixedRates, setUseMixedRates] = useState(false);
    const [newRate, setNewRate] = useState('');
    const [oldRateAmount, setOldRateAmount] = useState('');
    const [newRateAmount, setNewRateAmount] = useState('');
    const colorScheme = useColorScheme();
    const { showError, showSuccess, showWarning } = useNotification();

    useEffect(() => {
        loadTrip();
    }, [tripId]);

    // Configure header with Mix Rate button (only show for card payments)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                paymentMethod === 'card' && trip && trip.cardExchangeRate > 0 ? (
                    <TouchableOpacity
                        onPress={() => setShowMixedRateModal(true)}
                        style={{ padding: 8, marginRight: 8 }}
                    >
                        <FontAwesome
                            name="exchange"
                            size={20}
                            color={colorScheme === 'dark' ? '#FFFFFF' : '#007AFF'}
                        />
                    </TouchableOpacity>
                ) : null
            ),
        });
    }, [navigation, paymentMethod, trip, colorScheme]);

    const loadTrip = async () => {
        try {
            const trips = await StorageManager.loadTrips();
            const foundTrip = trips.find(t => t.id === tripId);
            if (foundTrip) {
                setTrip(foundTrip);
                if (foundTrip.travelers.length > 0) {
                    setPayerId(foundTrip.travelers[0].id);
                }
                // Set default payment method based on configured rates
                if (foundTrip.cardExchangeRate > 0) {
                    setPaymentMethod('card');
                } else if (foundTrip.cashExchangeRate > 0) {
                    setPaymentMethod('cash');
                }
            }
        } catch (error) {
            console.error('Error loading trip:', error);
        }
    };

    const updateTravelerAmount = (travelerId: string, amount: string) => {
        setTravelerAmounts(prev => ({
            ...prev,
            [travelerId]: amount
        }));
    };

    const createBill = async () => {
        if (!description.trim()) {
            showError('Please enter a bill description');
            return;
        }

        if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
            showError('Please enter a valid total amount');
            return;
        }

        if (!payerId) {
            showError('Please select who paid for this bill');
            return;
        }

        // Handle mixed rates validation
        if (useMixedRates && paymentMethod === 'card') {
            const oldAmount = parseFloat(oldRateAmount) || 0;
            const newAmount = parseFloat(newRateAmount) || 0;
            const billTotal = parseFloat(totalAmount);
            const newRateValue = parseFloat(newRate) || 0;

            if (oldAmount <= 0 && newAmount <= 0) {
                showError('Please enter amounts for mixed rate payment');
                return;
            }

            if (newRateValue <= 0) {
                showError('Please enter a valid new exchange rate');
                return;
            }

            if (Math.abs((oldAmount + newAmount) - billTotal) > 0.01) {
                showError('Mixed rate amounts must equal the bill total');
                return;
            }
        }

        // Determine which exchange rate to use based on payment method
        const effectiveExchangeRate = paymentMethod === 'card' ? trip!.cardExchangeRate : trip!.cashExchangeRate;
        
        if (!useMixedRates && (!effectiveExchangeRate || effectiveExchangeRate <= 0)) {
            showError(`No exchange rate configured for ${paymentMethod} payments`);
            return;
        }

        // Validate individual amounts
        const splits: BillSplit[] = [];
        let totalSplitAmount = 0;

        // Calculate weighted average rate for mixed payments
        let weightedRate = effectiveExchangeRate;
        if (useMixedRates && paymentMethod === 'card') {
            const oldAmount = parseFloat(oldRateAmount) || 0;
            const newAmount = parseFloat(newRateAmount) || 0;
            const totalMixed = oldAmount + newAmount;
            const oldRate = trip!.cardExchangeRate; // Use the default card rate as old rate
            const newRateValue = parseFloat(newRate) || 0;
            
            // Calculate weighted average rate for MYR conversion
            weightedRate = (oldAmount * oldRate + newAmount * newRateValue) / totalMixed;
        }

        for (const traveler of trip!.travelers) {
            const amountStr = travelerAmounts[traveler.id] || '0';
            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount < 0) {
                showError(`Please enter a valid amount for ${traveler.name}`);
                return;
            }

            if (amount > 0) {
                const amountMYR = amount / weightedRate;
                splits.push({
                    travelerId: traveler.id,
                    amount,
                    amountMYR
                });
                totalSplitAmount += amount;
            }
        }

        if (splits.length === 0) {
            showError('Please assign amounts to at least one traveler');
            return;
        }

        const billTotal = parseFloat(totalAmount);
        const additionalChargesValue = additionalCharges ? parseFloat(additionalCharges) : 0;

        // Validate that split amounts match the base bill total (not including additional charges)
        if (Math.abs(totalSplitAmount - billTotal) > 0.01) {
            showWarning(
                `Total split amount (${totalSplitAmount.toFixed(2)}) doesn't match bill total (${billTotal.toFixed(2)})`
            );
            return;
        }

        try {
            const trips = await StorageManager.loadTrips();
            const tripIndex = trips.findIndex(t => t.id === tripId);

            if (tripIndex !== -1) {
                const newBillId = Date.now().toString();

                // Add additional charges equally to each traveler's split
                const chargesPerPerson = additionalChargesValue / trip!.travelers.length;
                const updatedSplits = splits.map(split => ({
                    ...split,
                    amount: split.amount + chargesPerPerson,
                    amountMYR: (split.amount + chargesPerPerson) / weightedRate
                }));

                // Prepare mixed rates data if applicable
                let mixedRatesData = undefined;
                if (useMixedRates && paymentMethod === 'card') {
                    const oldAmount = parseFloat(oldRateAmount) || 0;
                    const newAmount = parseFloat(newRateAmount) || 0;
                    const newRateValue = parseFloat(newRate) || 0;
                    mixedRatesData = {
                        oldRate: trip!.cardExchangeRate,
                        oldAmount,
                        newRate: newRateValue,
                        newAmount
                    };
                }

                const newBill: Bill = {
                    id: newBillId,
                    tripId: tripId!,
                    description: description.trim(),
                    category: selectedCategory,
                    totalAmount: billTotal + additionalChargesValue, // Total includes additional charges
                    additionalCharges: additionalChargesValue > 0 ? additionalChargesValue : undefined,
                    payerId,
                    splits: updatedSplits,
                    paymentMethod,
                    customExchangeRate: useMixedRates ? undefined : effectiveExchangeRate, // Store single rate if not mixed
                    mixedRates: mixedRatesData, // Store mixed rates if applicable
                    createdAt: new Date(),
                };

                trips[tripIndex].bills.push(newBill);

                // Save trips without photos
                await StorageManager.saveTrips(trips);

                // Save receipt photos to file system if any
                if (receiptPhotos.length > 0) {
                    try {
                        // Since we limit to 1 photo, save the first (and only) photo
                        const photo = receiptPhotos[0];
                        const savedPhoto = await FileSystemStorage.saveReceiptPhoto(newBillId, photo.uri, 0);
                        console.log('Successfully saved receipt photo:', savedPhoto.name);
                    } catch (error) {
                        console.warn('Failed to save receipt photo:', error);
                        // Don't fail the entire bill creation if photo saving fails
                        showError('Bill created but failed to save receipt photo');
                    }
                }

                showSuccess('Bill created successfully!');

                // Navigate back to dashboard with proper refresh
                router.replace({
                    pathname: '/trip-dashboard',
                    params: { tripId }
                });
            }
        } catch (error) {
            console.error('Error creating bill:', error);
            showError('Failed to create bill');
        }
    };

    const distributeBillEqually = () => {
        if (!totalAmount || trip!.travelers.length === 0) return;

        const amount = parseFloat(totalAmount);
        if (isNaN(amount)) return;

        const equalAmount = (amount / trip!.travelers.length).toFixed(2);
        const newAmounts: { [key: string]: string } = {};

        trip!.travelers.forEach(traveler => {
            newAmounts[traveler.id] = equalAmount;
        });

        setTravelerAmounts(newAmounts);
    };

    if (!trip) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Bill Details</Text>

                        <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Description</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: Colors[colorScheme ?? 'light'].text,
                                    borderColor: Colors[colorScheme ?? 'light'].text + '40'
                                }
                            ]}
                            placeholder="e.g., Lunch at Restaurant"
                            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Category</Text>
                        <CategoryDropdown
                            selectedCategory={selectedCategory}
                            categories={BILL_CATEGORIES}
                            onSelectCategory={setSelectedCategory}
                            placeholder="Select category"
                        />

                        <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Total Amount ({trip.targetCurrency.code})</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: Colors[colorScheme ?? 'light'].text,
                                    borderColor: Colors[colorScheme ?? 'light'].text + '40'
                                }
                            ]}
                            placeholder="0.00"
                            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                            value={totalAmount}
                            onChangeText={setTotalAmount}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                            Additional Charges (Optional)
                        </Text>
                        <Text style={[styles.chargesSubtitle, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                            Tax, service charge, etc. - will be split equally among all travelers when bill is created
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: Colors[colorScheme ?? 'light'].text,
                                    borderColor: Colors[colorScheme ?? 'light'].text + '40'
                                }
                            ]}
                            placeholder="0.00"
                            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                            value={additionalCharges}
                            onChangeText={setAdditionalCharges}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Only show payment method section if rates are configured */}
                    {(trip.cardExchangeRate > 0 || trip.cashExchangeRate > 0) && (
                        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                            
                            <View style={styles.paymentMethodContainer}>
                                {trip.cardExchangeRate > 0 && (
                                    <TouchableOpacity
                                        style={[
                                            styles.paymentMethodButton,
                                            paymentMethod === 'card' && styles.paymentMethodButtonActive,
                                            { borderColor: Colors[colorScheme ?? 'light'].text + '40' },
                                            trip.cashExchangeRate <= 0 && { flex: 1 }
                                        ]}
                                        onPress={() => setPaymentMethod('card')}
                                    >
                                        <FontAwesome 
                                            name="credit-card" 
                                            size={20} 
                                            color={paymentMethod === 'card' ? '#007AFF' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.paymentMethodText,
                                            paymentMethod === 'card' && styles.paymentMethodTextActive,
                                            { color: paymentMethod === 'card' ? '#007AFF' : Colors[colorScheme ?? 'light'].text }
                                        ]}>Card</Text>
                                        <Text style={[styles.ratePreview, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                            {trip.cardExchangeRate} {trip.targetCurrency.code}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {trip.cashExchangeRate > 0 && (
                                    <TouchableOpacity
                                        style={[
                                            styles.paymentMethodButton,
                                            paymentMethod === 'cash' && styles.paymentMethodButtonActive,
                                            { borderColor: Colors[colorScheme ?? 'light'].text + '40' },
                                            trip.cardExchangeRate <= 0 && { flex: 1 }
                                        ]}
                                        onPress={() => setPaymentMethod('cash')}
                                    >
                                        <FontAwesome 
                                            name="money" 
                                            size={20} 
                                            color={paymentMethod === 'cash' ? '#FF9500' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.paymentMethodText,
                                            paymentMethod === 'cash' && styles.paymentMethodTextActive,
                                            { color: paymentMethod === 'cash' ? '#FF9500' : Colors[colorScheme ?? 'light'].text }
                                        ]}>Cash</Text>
                                        <Text style={[styles.ratePreview, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                            {trip.cashExchangeRate} {trip.targetCurrency.code}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Who Paid?</Text>
                        {trip.travelers.map((traveler) => (
                            <TouchableOpacity
                                key={traveler.id}
                                style={[
                                    styles.payerOption,
                                    payerId === traveler.id && {
                                        backgroundColor: colorScheme === 'dark' ? '#1e3a8a' : '#e3f2fd'
                                    }
                                ]}
                                onPress={() => setPayerId(traveler.id)}
                            >
                                <View style={[
                                    styles.radioButton,
                                    payerId === traveler.id && styles.radioButtonSelected
                                ]}>
                                    {payerId === traveler.id && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                                <Text style={styles.payerName}>{traveler.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Split Amounts</Text>
                            <TouchableOpacity
                                style={[
                                    styles.equalSplitButton,
                                    { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }
                                ]}
                                onPress={distributeBillEqually}
                            >
                                <Text style={styles.equalSplitText}>Equal Split</Text>
                            </TouchableOpacity>
                        </View>

                        {trip.travelers.map((traveler) => {
                            const amount = travelerAmounts[traveler.id] || '';
                            const effectiveRate = paymentMethod === 'card' ? trip.cardExchangeRate : trip.cashExchangeRate;
                            const amountMYR = amount && effectiveRate > 0 ? (parseFloat(amount) / effectiveRate).toFixed(3) : '0.000';

                            return (
                                <View key={traveler.id} style={styles.travelerAmountContainer}>
                                    <View style={styles.travelerInfo}>
                                        <Text style={styles.travelerName}>{traveler.name}</Text>
                                        <Text style={styles.travelerAmountMYR}>≈ RM {amountMYR}</Text>
                                    </View>
                                    <TextInput
                                        style={[
                                            styles.amountInput,
                                            {
                                                color: Colors[colorScheme ?? 'light'].text,
                                                borderColor: Colors[colorScheme ?? 'light'].text + '40'
                                            }
                                        ]}
                                        placeholder="0.00"
                                        placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                        value={amount}
                                        onChangeText={(value) => updateTravelerAmount(traveler.id, value)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            );
                        })}
                    </View>

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <ReceiptPhotoUpload
                            photos={receiptPhotos}
                            onPhotosChange={setReceiptPhotos}
                            maxPhotos={1}
                        />
                    </View>

                    <TouchableOpacity style={styles.createButton} onPress={createBill}>
                        <Text style={styles.createButtonText}>Create Bill</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Mixed Rate Modal */}
            <Modal
                visible={showMixedRateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMixedRateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        {!useMixedRates ? (
                            <>
                                <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    Use Mixed Exchange Rate?
                                </Text>
                                <Text style={[styles.modalDescription, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                    This allows you to split the payment between the old rate ({trip?.cardExchangeRate}) and a new exchange rate.
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonCancel]}
                                        onPress={() => setShowMixedRateModal(false)}
                                    >
                                        <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonConfirm]}
                                        onPress={() => setUseMixedRates(true)}
                                    >
                                        <Text style={styles.modalButtonTextConfirm}>Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    Mixed Rate Payment
                                </Text>
                                <Text style={[styles.modalDescription, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                    Enter the new exchange rate and amounts to pay with each rate.
                                </Text>

                                <Text style={[styles.modalLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    New Exchange Rate (1 MYR = ? {trip?.targetCurrency.code})
                                </Text>
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        {
                                            color: Colors[colorScheme ?? 'light'].text,
                                            borderColor: Colors[colorScheme ?? 'light'].text + '40',
                                            backgroundColor: Colors[colorScheme ?? 'light'].background
                                        }
                                    ]}
                                    placeholder="e.g., 5.50"
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                    value={newRate}
                                    onChangeText={setNewRate}
                                    keyboardType="numeric"
                                />

                                <Text style={[styles.modalLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    Amount with Old Rate ({trip?.cardExchangeRate})
                                </Text>
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        {
                                            color: Colors[colorScheme ?? 'light'].text,
                                            borderColor: Colors[colorScheme ?? 'light'].text + '40',
                                            backgroundColor: Colors[colorScheme ?? 'light'].background
                                        }
                                    ]}
                                    placeholder="0.00"
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                    value={oldRateAmount}
                                    onChangeText={setOldRateAmount}
                                    keyboardType="numeric"
                                />

                                <Text style={[styles.modalLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                                    Amount with New Rate
                                </Text>
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        {
                                            color: Colors[colorScheme ?? 'light'].text,
                                            borderColor: Colors[colorScheme ?? 'light'].text + '40',
                                            backgroundColor: Colors[colorScheme ?? 'light'].background
                                        }
                                    ]}
                                    placeholder="0.00"
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                    value={newRateAmount}
                                    onChangeText={setNewRateAmount}
                                    keyboardType="numeric"
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonCancel]}
                                        onPress={() => {
                                            setUseMixedRates(false);
                                            setNewRate('');
                                            setOldRateAmount('');
                                            setNewRateAmount('');
                                            setShowMixedRateModal(false);
                                        }}
                                    >
                                        <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonConfirm]}
                                        onPress={() => setShowMixedRateModal(false)}
                                    >
                                        <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    payerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#007AFF',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },
    payerName: {
        fontSize: 16,
    },
    equalSplitButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    equalSplitText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    travelerAmountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    travelerInfo: {
        flex: 1,
    },
    travelerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    travelerAmountMYR: {
        fontSize: 12,
        color: '#666',
    },
    amountInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        fontSize: 16,
        width: 100,
        textAlign: 'right',
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    createButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    chargesSubtitle: {
        fontSize: 12,
        marginBottom: 8,
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentMethodButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    paymentMethodButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF10',
    },
    paymentMethodText: {
        fontSize: 16,
        fontWeight: '600',
    },
    paymentMethodTextActive: {
    },
    ratePreview: {
        fontSize: 12,
        marginTop: 2,
    },
    exchangeRateInfo: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    exchangeRateLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    customRateToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    customRateToggleText: {
        fontSize: 16,
    },
    customRateInput: {
        marginTop: 8,
    },
    exchangeRateHelp: {
        fontSize: 12,
        marginTop: -8,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    balancesSummary: {
        marginBottom: 16,
        gap: 8,
    },
    balanceSummaryItem: {
        padding: 12,
        borderRadius: 8,
    },
    balanceSummaryText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    balanceSummaryRate: {
        fontSize: 12,
    },
    mixedRateInputs: {
        marginTop: 16,
        gap: 16,
    },
    mixedRateInputContainer: {
        marginBottom: 8,
    },
    mixedRateHelp: {
        fontSize: 12,
        marginBottom: 8,
    },
    mixedRateTotalCheck: {
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    mixedRateTotalLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    mixedRateTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    mixedRateError: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#f0f0f0',
    },
    modalButtonConfirm: {
        backgroundColor: '#007AFF',
    },
    modalButtonTextCancel: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonTextConfirm: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});