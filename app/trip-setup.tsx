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
import { Trip, Traveler, Currency } from '@/types';
import { CURRENCIES, DEFAULT_BASE_CURRENCY } from '@/constants/Currencies';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useNotification } from '@/components/providers/NotificationProvider';
import { StorageManager } from '@/utils/StorageManager';

export default function TripSetupScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [travelers, setTravelers] = useState<Traveler[]>([]);
    const [newTravelerName, setNewTravelerName] = useState('');
    const [selectedTargetCurrency, setSelectedTargetCurrency] = useState<Currency>(CURRENCIES[1]);
    const [exchangeRate, setExchangeRate] = useState('');
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const colorScheme = useColorScheme();
    const { showError, showSuccess } = useNotification();

    useEffect(() => {
        loadTrip();
    }, [tripId]);

    const loadTrip = async () => {
        try {
            const trips = await StorageManager.loadTrips();
            const foundTrip = trips.find(t => t.id === tripId);
            if (foundTrip) {
                setTrip(foundTrip);
                setTravelers(foundTrip.travelers);
                setSelectedTargetCurrency(foundTrip.targetCurrency);
                setExchangeRate(foundTrip.exchangeRate.toString());
            }
        } catch (error) {
            console.error('Error loading trip:', error);
        }
    };

    const addTraveler = () => {
        if (!newTravelerName.trim()) {
            showError('Please enter a traveler name');
            return;
        }

        const newTraveler: Traveler = {
            id: Date.now().toString(),
            name: newTravelerName.trim(),
        };

        setTravelers([...travelers, newTraveler]);
        setNewTravelerName('');
    };

    const removeTraveler = (travelerId: string) => {
        setTravelers(travelers.filter(t => t.id !== travelerId));
    };

    const saveAndContinue = async () => {
        if (travelers.length === 0) {
            showError('Please add at least one traveler');
            return;
        }

        if (!exchangeRate || isNaN(parseFloat(exchangeRate)) || parseFloat(exchangeRate) <= 0) {
            showError('Please enter a valid exchange rate');
            return;
        }

        try {
            const trips = await StorageManager.loadTrips();
            const tripIndex = trips.findIndex(t => t.id === tripId);

            if (tripIndex !== -1) {
                trips[tripIndex] = {
                    ...trips[tripIndex],
                    travelers,
                    targetCurrency: selectedTargetCurrency,
                    exchangeRate: parseFloat(exchangeRate),
                };

                await StorageManager.saveTrips(trips);

                showSuccess('Trip setup completed!');

                router.replace({
                    pathname: '/trip-dashboard',
                    params: { tripId }
                });
            }
        } catch (error) {
            console.error('Error saving trip setup:', error);
            showError('Failed to save trip setup');
        }
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
                        <Text style={styles.sectionTitle}>Trip: {trip.name}</Text>
                    </View>

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Add Travelers</Text>
                        <Text style={styles.sectionDescription}>
                            Who are you traveling with?
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: Colors[colorScheme ?? 'light'].text,
                                        borderColor: Colors[colorScheme ?? 'light'].text + '40'
                                    }
                                ]}
                                placeholder="Enter traveler name"
                                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                value={newTravelerName}
                                onChangeText={setNewTravelerName}
                                onSubmitEditing={addTraveler}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addTraveler}>
                                <FontAwesome name="plus" size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        {travelers.map((traveler) => (
                            <View key={traveler.id} style={[
                                styles.travelerItem,
                                { backgroundColor: colorScheme === 'dark' ? '#333' : '#f8f9fa' }
                            ]}>
                                <Text style={styles.travelerName}>{traveler.name}</Text>
                                <TouchableOpacity
                                    onPress={() => removeTraveler(traveler.id)}
                                    style={styles.removeButton}
                                >
                                    <FontAwesome name="times" size={16} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Currency Setup</Text>

                        <View style={styles.currencyRow}>
                            <View style={styles.currencyItem}>
                                <Text style={styles.currencyLabel}>From (Base)</Text>
                                <View style={[
                                    styles.currencySelector,
                                    {
                                        borderColor: Colors[colorScheme ?? 'light'].text + '40',
                                        backgroundColor: colorScheme === 'dark' ? '#333' : '#f8f9fa'
                                    }
                                ]}>
                                    <Text style={styles.currencyText}>
                                        {DEFAULT_BASE_CURRENCY.code} - {DEFAULT_BASE_CURRENCY.name}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.currencyRow}>
                            <View style={styles.currencyItem}>
                                <Text style={styles.currencyLabel}>To (Target)</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.currencySelector,
                                        {
                                            borderColor: Colors[colorScheme ?? 'light'].text + '40',
                                            backgroundColor: colorScheme === 'dark' ? '#333' : '#f8f9fa'
                                        }
                                    ]}
                                    onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                                >
                                    <Text style={styles.currencyText}>
                                        {selectedTargetCurrency.code} - {selectedTargetCurrency.name}
                                    </Text>
                                    <FontAwesome name="chevron-down" size={12} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showCurrencyPicker && (
                            <View style={[
                                styles.currencyPicker,
                                {
                                    borderColor: Colors[colorScheme ?? 'light'].text + '40',
                                    backgroundColor: Colors[colorScheme ?? 'light'].background
                                }
                            ]}>
                                {CURRENCIES.filter(c => c.code !== DEFAULT_BASE_CURRENCY.code).map((currency) => (
                                    <TouchableOpacity
                                        key={currency.code}
                                        style={[
                                            styles.currencyOption,
                                            { borderBottomColor: Colors[colorScheme ?? 'light'].text + '20' }
                                        ]}
                                        onPress={() => {
                                            setSelectedTargetCurrency(currency);
                                            setShowCurrencyPicker(false);
                                        }}
                                    >
                                        <Text style={styles.currencyText}>
                                            {currency.code} - {currency.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.exchangeRateSection}>
                            <Text style={styles.currencyLabel}>Exchange Rate</Text>
                            <Text style={styles.exchangeHelp}>
                                1 {DEFAULT_BASE_CURRENCY.code} = ? {selectedTargetCurrency.code}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: Colors[colorScheme ?? 'light'].text,
                                        borderColor: Colors[colorScheme ?? 'light'].text + '40'
                                    }
                                ]}
                                placeholder={`e.g., 331.65 (for ${selectedTargetCurrency.code})`}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                value={exchangeRate}
                                onChangeText={setExchangeRate}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.continueButton} onPress={saveAndContinue}>
                        <Text style={styles.continueButtonText}>Save & Continue to Dashboard</Text>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    travelerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    travelerName: {
        fontSize: 16,
    },
    removeButton: {
        padding: 4,
    },
    currencyRow: {
        marginBottom: 16,
    },
    currencyItem: {
        flex: 1,
    },
    currencyLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    currencySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    currencyText: {
        fontSize: 16,
    },
    currencyPicker: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    currencyOption: {
        padding: 16,
        borderBottomWidth: 1,
    },
    exchangeRateSection: {
        marginTop: 8,
    },
    exchangeHelp: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    continueButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});