import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
    Platform,
    Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Trip, Bill } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface BillSplitSummaryProps {
    trip: Trip;
    selectedDate: Date | null;
    onDateChange: (date: Date | null) => void;
}

interface DaySummary {
    totalAmount: number;
    totalAmountMYR: number;
    billCount: number;
    travelers: {
        [travelerId: string]: {
            name: string;
            totalOwed: number;
            totalOwedMYR: number;
            billsPaid: number;
            billsOwed: number;
        };
    };
    categories: {
        [categoryId: string]: {
            name: string;
            color: string;
            icon: string;
            totalAmount: number;
            totalAmountMYR: number;
            billCount: number;
        };
    };
}

const { width: screenWidth } = Dimensions.get('window');

export default function BillSplitSummary({ trip, selectedDate, onDateChange }: BillSplitSummaryProps) {
    const colorScheme = useColorScheme();
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Animation values
    const contentAnimation = useRef(new Animated.Value(0)).current;
    const fadeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate content in when component mounts or selectedDate changes
        Animated.parallel([
            Animated.timing(contentAnimation, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [selectedDate]);

    // Calculate summary for the selected date
    const daySummary = useMemo((): DaySummary | null => {
        if (!selectedDate) return null;

        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayBills = trip.bills.filter(bill => {
            const billDate = new Date(bill.createdAt);
            billDate.setHours(0, 0, 0, 0);
            return billDate.getTime() === targetDate.getTime();
        });

        if (dayBills.length === 0) return null;

        const summary: DaySummary = {
            totalAmount: 0,
            totalAmountMYR: 0,
            billCount: dayBills.length,
            travelers: {},
            categories: {},
        };

        // Initialize travelers
        trip.travelers.forEach(traveler => {
            summary.travelers[traveler.id] = {
                name: traveler.name,
                totalOwed: 0,
                totalOwedMYR: 0,
                billsPaid: 0,
                billsOwed: 0,
            };
        });

        // Process each bill
        dayBills.forEach(bill => {
            // Determine the effective exchange rate for this bill
            const effectiveRate = bill.customExchangeRate ||
                (bill.paymentMethod === 'card' ? trip.cardExchangeRate : trip.cashExchangeRate) ||
                trip.exchangeRate; // Fallback to deprecated rate for backward compatibility

            // Calculate MYR amount using the correct rate
            const billAmountMYR = bill.totalAmount / effectiveRate;

            // Add to categories
            if (!summary.categories[bill.category.id]) {
                summary.categories[bill.category.id] = {
                    name: bill.category.name,
                    color: bill.category.color,
                    icon: bill.category.icon,
                    totalAmount: 0,
                    totalAmountMYR: 0,
                    billCount: 0,
                };
            }
            summary.categories[bill.category.id].totalAmount += bill.totalAmount;
            summary.categories[bill.category.id].totalAmountMYR += billAmountMYR;
            summary.categories[bill.category.id].billCount += 1;

            // Add to total
            summary.totalAmount += bill.totalAmount;
            summary.totalAmountMYR += billAmountMYR;

            // Process splits
            bill.splits.forEach(split => {
                summary.travelers[split.travelerId].totalOwed += split.amount;
                summary.travelers[split.travelerId].totalOwedMYR += split.amountMYR;

                if (split.travelerId === bill.payerId) {
                    summary.travelers[split.travelerId].billsPaid += 1;
                } else {
                    summary.travelers[split.travelerId].billsOwed += 1;
                }
            });
        });

        return summary;
    }, [trip, selectedDate]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };




    const renderTravelerOwedChart = () => {
        if (!daySummary) return null;

        // Calculate who owes who based on the bills for this day
        const dayBills = trip.bills.filter(bill => {
            const billDate = new Date(bill.createdAt);
            billDate.setHours(0, 0, 0, 0);
            const targetDate = new Date(selectedDate!);
            targetDate.setHours(0, 0, 0, 0);
            return billDate.getTime() === targetDate.getTime();
        });

        // Create a map of who owes who
        const owesMap: { [key: string]: { [key: string]: { amount: number; amountMYR: number } } } = {};

        // Initialize the map
        trip.travelers.forEach(traveler => {
            owesMap[traveler.id] = {};
            trip.travelers.forEach(otherTraveler => {
                if (traveler.id !== otherTraveler.id) {
                    owesMap[traveler.id][otherTraveler.id] = { amount: 0, amountMYR: 0 };
                }
            });
        });

        // Process each bill to calculate who owes who
        dayBills.forEach(bill => {
            const payer = bill.payerId;

            // Determine the effective exchange rate for this bill
            const effectiveRate = bill.customExchangeRate ||
                (bill.paymentMethod === 'card' ? trip.cardExchangeRate : trip.cashExchangeRate) ||
                trip.exchangeRate; // Fallback to deprecated rate for backward compatibility

            bill.splits.forEach(split => {
                if (split.travelerId !== payer) {
                    // This traveler owes the payer
                    // Use the pre-calculated amountMYR from the split for accuracy
                    owesMap[split.travelerId][payer].amount += split.amount;
                    owesMap[split.travelerId][payer].amountMYR += split.amountMYR;
                }
            });
        });

        // Create simplified "who owes who" list
        const owedTransactions: Array<{
            debtor: string;
            debtorName: string;
            creditor: string;
            creditorName: string;
            amount: number;
            amountMYR: number;
        }> = [];

        Object.keys(owesMap).forEach(debtorId => {
            Object.keys(owesMap[debtorId]).forEach(creditorId => {
                const owedData = owesMap[debtorId][creditorId];
                if (owedData.amount > 0) {
                    const debtor = trip.travelers.find(t => t.id === debtorId);
                    const creditor = trip.travelers.find(t => t.id === creditorId);
                    if (debtor && creditor) {
                        owedTransactions.push({
                            debtor: debtorId,
                            debtorName: debtor.name,
                            creditor: creditorId,
                            creditorName: creditor.name,
                            amount: owedData.amount,
                            amountMYR: owedData.amountMYR,
                        });
                    }
                }
            });
        });

        if (owedTransactions.length === 0) {
            return (
                <View style={[styles.chartContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                    <Text style={[styles.chartTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Who Owes Who
                    </Text>
                    <View style={styles.noTransactionsContainer}>
                        <FontAwesome name="check-circle" size={48} color="#34C759" />
                        <Text style={[styles.noTransactionsText, { color: Colors[colorScheme ?? 'light'].text + '60' }]}>
                            All settled up! No money owed.
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.chartContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                <Text style={[styles.chartTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Who Owes Who
                </Text>
                {owedTransactions.map((transaction, index) => (
                    <View key={index} style={[
                        styles.owedRow,
                        { borderBottomColor: Colors[colorScheme ?? 'light'].text + '20' }
                    ]}>
                        <View style={styles.owedInfo}>
                            <View style={styles.owedFlow}>
                                <View style={styles.personContainer}>
                                    <View style={[styles.personIcon, { backgroundColor: '#FF6B6B20' }]}>
                                        <FontAwesome name="user" size={16} color="#FF6B6B" />
                                    </View>
                                    <Text style={[styles.personName, { color: '#FF6B6B' }]}>
                                        {transaction.debtorName}
                                    </Text>
                                </View>

                                <View style={styles.arrowContainer}>
                                    <FontAwesome name="arrow-right" size={16} color="#007AFF" />
                                    <Text style={styles.owesText}>owes</Text>
                                </View>

                                <View style={styles.personContainer}>
                                    <View style={[styles.personIcon, { backgroundColor: '#34C75920' }]}>
                                        <FontAwesome name="user" size={16} color="#34C759" />
                                    </View>
                                    <Text style={[styles.personName, { color: '#34C759' }]}>
                                        {transaction.creditorName}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[
                            styles.owedAmount,
                            {
                                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                                borderColor: Colors[colorScheme ?? 'light'].text + '20'
                            }
                        ]}>
                            <Text style={[styles.owedAmountText, { color: Colors[colorScheme ?? 'light'].text }]}>
                                {trip.targetCurrency.symbol}{transaction.amount.toFixed(2)}
                            </Text>
                            <Text style={[styles.owedAmountMYR, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                RM {transaction.amountMYR.toFixed(3)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Date Selector */}
            <View style={[styles.dateSelector, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                <TouchableOpacity
                    style={[styles.dateButton, {
                        backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                        borderColor: Colors[colorScheme ?? 'light'].text + '20'
                    }]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <FontAwesome name="calendar" size={16} color={Colors[colorScheme ?? 'light'].text} />
                    <Text style={[styles.dateButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {selectedDate ? formatDate(selectedDate) : 'Select Date'}
                    </Text>
                    <FontAwesome name="chevron-down" size={14} color={Colors[colorScheme ?? 'light'].text + '60'} />
                </TouchableOpacity>
            </View>

            {daySummary ? (
                <Animated.View
                    style={[
                        styles.animatedSummaryContent,
                        {
                            opacity: fadeAnimation,
                            transform: [
                                {
                                    translateY: contentAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0],
                                    }),
                                },
                            ],
                        }
                    ]}
                >
                    {/* Summary Header */}
                    <View style={[styles.summaryHeader, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={styles.summaryStats}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#007AFF' }]}>
                                    {trip.targetCurrency.symbol}{daySummary.totalAmount.toFixed(2)}
                                </Text>
                                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                    Total Spent
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#34C759' }]}>
                                    {daySummary.billCount}
                                </Text>
                                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                    Bills
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#FF9500' }]}>
                                    RM {daySummary.totalAmountMYR.toFixed(2)}
                                </Text>
                                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>
                                    In MYR
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Charts */}
                    {renderTravelerOwedChart()}
                </Animated.View>
            ) : (
                <View style={styles.emptyState}>
                    <FontAwesome name="bar-chart" size={64} color="#ccc" />
                    <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text + '60' }]}>
                        No bills found for this date
                    </Text>
                    <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].text + '40' }]}>
                        Select a different date or add some bills
                    </Text>
                </View>
            )}

            {/* Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.datePickerModal, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].text + '20' }]}>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={[styles.modalCancelText, { color: Colors[colorScheme ?? 'light'].primary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                Select Date
                            </Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={[styles.modalConfirmText, { color: Colors[colorScheme ?? 'light'].primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick Date Options */}
                        <View style={styles.quickDateContainer}>
                            <Text style={[styles.quickDateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Quick Select</Text>
                            <View style={styles.quickDateButtons}>
                                <TouchableOpacity
                                    style={[styles.quickDateButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                                    onPress={() => {
                                        const today = new Date();
                                        onDateChange(today);
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={[styles.quickDateButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>Today</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickDateButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                                    onPress={() => {
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        onDateChange(yesterday);
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={[styles.quickDateButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>Yesterday</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickDateButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                                    onPress={() => {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        onDateChange(tomorrow);
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={[styles.quickDateButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>Tomorrow</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Recent Dates */}
                        <View style={styles.datePickerContainer}>
                            <Text style={[styles.datePickerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Recent Dates</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentDatesContainer}>
                                {Array.from({ length: 14 }, (_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + i - 7); // 7 days ago to 7 days from now
                                    const isToday = i === 7;
                                    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[
                                                styles.dateChip,
                                                {
                                                    backgroundColor: isSelected
                                                        ? Colors[colorScheme ?? 'light'].primary + '20'
                                                        : Colors[colorScheme ?? 'light'].surface
                                                }
                                            ]}
                                            onPress={() => {
                                                onDateChange(date);
                                                setShowDatePicker(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.dateChipDay,
                                                {
                                                    color: isSelected
                                                        ? Colors[colorScheme ?? 'light'].primary
                                                        : Colors[colorScheme ?? 'light'].text
                                                }
                                            ]}>
                                                {date.getDate()}
                                            </Text>
                                            <Text style={[
                                                styles.dateChipMonth,
                                                {
                                                    color: isSelected
                                                        ? Colors[colorScheme ?? 'light'].primary
                                                        : Colors[colorScheme ?? 'light'].text + '80'
                                                }
                                            ]}>
                                                {date.toLocaleDateString('en', { month: 'short' })}
                                            </Text>
                                            {isToday && (
                                                <View style={styles.todayBadge}>
                                                    <Text style={styles.todayBadgeText}>Today</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    animatedSummaryContent: {
        flex: 1,
    },
    dateSelector: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    dateButtonText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    summaryHeader: {
        padding: 20,
        borderRadius: 12,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryStats: {
        flexDirection: 'column',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    chartContainer: {
        margin: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    // Who Owes Who Chart Styles
    owedRow: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    owedInfo: {
        marginBottom: 12,
    },
    owedFlow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    personContainer: {
        flex: 1,
        alignItems: 'center',
    },
    personIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    personName: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    arrowContainer: {
        alignItems: 'center',
        marginHorizontal: 16,
    },
    owesText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    owedAmount: {
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    owedAmountText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    owedAmountMYR: {
        fontSize: 14,
        fontWeight: '500',
    },
    noTransactionsContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    noTransactionsText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerModal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '400',
    },
    modalConfirmText: {
        fontSize: 16,
        fontWeight: '600',
    },
    quickDateContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    quickDateTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    quickDateButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    quickDateButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    quickDateButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    datePickerContainer: {
        padding: 20,
    },
    datePickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    dateInputContainer: {
        marginTop: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 12,
    },
    dateInputText: {
        fontSize: 16,
        fontWeight: '500',
    },
    recentDatesContainer: {
        marginTop: 12,
    },
    dateChip: {
        width: 60,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateChipDay: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    dateChipMonth: {
        fontSize: 12,
        fontWeight: '500',
    },
    todayBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    todayBadgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
