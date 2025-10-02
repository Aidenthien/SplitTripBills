import {
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { Text, View } from '@/components/Themed';
import { Trip, Bill, BillSplit, BillCategory } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useNotification } from '@/components/providers/NotificationProvider';
import { CategoryDropdown } from '@/ui/components';
import { BILL_CATEGORIES, getDefaultCategory } from '@/constants/BillCategories';

export default function CreateBillScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<BillCategory>(getDefaultCategory());
    const [totalAmount, setTotalAmount] = useState('');
    const [payerId, setPayerId] = useState('');
    const [travelerAmounts, setTravelerAmounts] = useState<{ [key: string]: string }>({});
    const colorScheme = useColorScheme();
    const { showError, showSuccess, showWarning } = useNotification();

    useEffect(() => {
        loadTrip();
    }, [tripId]);

    const loadTrip = async () => {
        try {
            const savedTrips = await AsyncStorage.getItem('trips');
            if (savedTrips) {
                const trips: Trip[] = JSON.parse(savedTrips);
                const foundTrip = trips.find(t => t.id === tripId);
                if (foundTrip) {
                    setTrip(foundTrip);
                    if (foundTrip.travelers.length > 0) {
                        setPayerId(foundTrip.travelers[0].id);
                    }
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

        // Validate individual amounts
        const splits: BillSplit[] = [];
        let totalSplitAmount = 0;

        for (const traveler of trip!.travelers) {
            const amountStr = travelerAmounts[traveler.id] || '0';
            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount < 0) {
                showError(`Please enter a valid amount for ${traveler.name}`);
                return;
            }

            if (amount > 0) {
                const amountMYR = amount / trip!.exchangeRate;
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
        if (Math.abs(totalSplitAmount - billTotal) > 0.01) {
            showWarning(
                `Total split amount (${totalSplitAmount.toFixed(2)}) doesn't match bill total (${billTotal.toFixed(2)})`
            );
            return;
        }

        try {
            const savedTrips = await AsyncStorage.getItem('trips');
            if (savedTrips) {
                const trips: Trip[] = JSON.parse(savedTrips);
                const tripIndex = trips.findIndex(t => t.id === tripId);

                if (tripIndex !== -1) {
                    const newBill: Bill = {
                        id: Date.now().toString(),
                        tripId: tripId!,
                        description: description.trim(),
                        category: selectedCategory,
                        totalAmount: billTotal,
                        payerId,
                        splits,
                        createdAt: new Date(),
                    };

                    trips[tripIndex].bills.push(newBill);
                    await AsyncStorage.setItem('trips', JSON.stringify(trips));

                    showSuccess('Bill created successfully!');

                    // Navigate back to dashboard following navigation best practices
                    router.back();
                }
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
                    </View>

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
                            const amountMYR = amount ? (parseFloat(amount) / trip.exchangeRate).toFixed(3) : '0.000';

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

                    <TouchableOpacity style={styles.createButton} onPress={createBill}>
                        <Text style={styles.createButtonText}>Create Bill</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
});