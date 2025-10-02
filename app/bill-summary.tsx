import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { Trip, Bill, PaymentSummary } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function BillSummaryScreen() {
    const { tripId, billId } = useLocalSearchParams<{ tripId: string; billId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [bill, setBill] = useState<Bill | null>(null);
    const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
    const colorScheme = useColorScheme();

    useEffect(() => {
        loadData();
    }, [tripId, billId]);

    const loadData = async () => {
        try {
            const savedTrips = await AsyncStorage.getItem('trips');
            if (savedTrips) {
                const trips: Trip[] = JSON.parse(savedTrips);
                const foundTrip = trips.find(t => t.id === tripId);
                if (foundTrip) {
                    setTrip(foundTrip);
                    const foundBill = foundTrip.bills.find(b => b.id === billId);
                    if (foundBill) {
                        setBill(foundBill);
                        calculatePaymentSummary(foundTrip, foundBill);
                    }
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
        // Use router.back() for natural navigation instead of router.push()
        // This will go back to the previous screen in the navigation stack
        router.back();
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
                            <FontAwesome name="file-text" size={24} color="#007AFF" />
                            <Text style={styles.billTitle}>{bill.description}</Text>
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

                    {/* Bill Summary */}
                    <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <Text style={styles.sectionTitle}>Bill Summary</Text>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount:</Text>
                            <Text style={styles.summaryValue}>
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
                                    { backgroundColor: Colors[colorScheme ?? 'light'].card }
                                ]}>
                                    <View style={styles.paymentHeader}>
                                        <View style={styles.debtorSection}>
                                            <View style={[
                                                styles.personIcon,
                                                { backgroundColor: Colors[colorScheme ?? 'light'].surface }
                                            ]}>
                                                <FontAwesome name="user" size={16} color="#FF6B6B" />
                                            </View>
                                            <Text style={styles.debtorName}>{payment.travelerName}</Text>
                                        </View>

                                        <View style={styles.arrowSection}>
                                            <FontAwesome name="long-arrow-right" size={20} color="#4ECDC4" />
                                            <Text style={styles.owesText}>owes</Text>
                                        </View>

                                        <View style={styles.creditorSection}>
                                            <View style={[
                                                styles.personIcon,
                                                { backgroundColor: Colors[colorScheme ?? 'light'].surface }
                                            ]}>
                                                <FontAwesome name="user" size={16} color="#4CAF50" />
                                            </View>
                                            <Text style={styles.creditorName}>{payment.owesToName}</Text>
                                        </View>
                                    </View>

                                    <View style={[
                                        styles.amountSection,
                                        { backgroundColor: Colors[colorScheme ?? 'light'].surface }
                                    ]}>
                                        <View style={styles.primaryAmount}>
                                            <FontAwesome name="money" size={16} color="#FF9500" />
                                            <Text style={styles.paymentAmount}>
                                                {trip.targetCurrency.symbol}{payment.totalOwed.toFixed(2)} {trip.targetCurrency.code}
                                            </Text>
                                        </View>
                                        <View style={styles.convertedAmount}>
                                            <FontAwesome name="exchange" size={12} color="#666" />
                                            <Text style={styles.paymentAmountMYR}>
                                                RM {payment.totalOwedMYR.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.backButton} onPress={goBackToDashboard}>
                            <FontAwesome name="arrow-left" size={16} color="#007AFF" />
                            <Text style={styles.backButtonText}>Back to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
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
    billHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    billTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
        flex: 1,
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
        color: '#FF9500',
        marginLeft: 8,
    },
    paymentAmountMYR: {
        fontSize: 14,
        color: '#666',
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
        borderLeftColor: '#4ECDC4',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    debtorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B6B',
    },
    creditorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
    owesText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        fontStyle: 'italic',
    },
    amountSection: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
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
});