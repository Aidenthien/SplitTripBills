import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Trip, Bill } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import ScreenTransition from '@/ui/components/ScreenTransition';

export default function TripDashboardScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const colorScheme = useColorScheme();

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
                }
            }
        } catch (error) {
            console.error('Error loading trip:', error);
        }
    };

    const createNewBill = () => {
        router.push({
            pathname: '/create-bill',
            params: { tripId }
        });
    };

    const viewBill = (bill: Bill) => {
        router.push({
            pathname: '/bill-summary',
            params: {
                tripId,
                billId: bill.id
            }
        });
    };

    const renderBillCard = ({ item }: { item: Bill }) => {
        const totalOwed = item.splits.reduce((sum, split) => sum + split.amount, 0);

        return (
            <TouchableOpacity
                style={[
                    styles.billCard,
                    { backgroundColor: Colors[colorScheme ?? 'light'].background }
                ]}
                onPress={() => viewBill(item)}
            >
                <View style={styles.billInfo}>
                    <Text style={styles.billDescription}>{item.description}</Text>
                    <Text style={styles.billAmount}>
                        Total: {trip?.targetCurrency.symbol}{item.totalAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.billDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
        );
    };

    if (!trip) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScreenTransition animationType="slide" duration={300}>
            <SafeAreaView style={styles.container}>
                <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                    <View>
                        <Text style={styles.tripName}>{trip.name}</Text>
                        <Text style={styles.tripInfo}>
                            {trip.travelers.length} travelers • {trip.baseCurrency.code} → {trip.targetCurrency.code}
                        </Text>
                        <Text style={styles.exchangeRate}>
                            Rate: 1 {trip.baseCurrency.code} = {trip.exchangeRate} {trip.targetCurrency.code}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Split Bills</Text>
                        <TouchableOpacity style={styles.addButton} onPress={createNewBill}>
                            <FontAwesome name="plus" size={16} color="white" />
                            <Text style={styles.addButtonText}>New Bill</Text>
                        </TouchableOpacity>
                    </View>

                    {trip.bills.length === 0 ? (
                        <View style={styles.emptyState}>
                            <FontAwesome name="file-text-o" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No bills yet</Text>
                            <Text style={styles.emptySubtext}>Create your first split bill</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={trip.bills}
                            renderItem={renderBillCard}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </SafeAreaView>
        </ScreenTransition>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tripName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tripInfo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    exchangeRate: {
        fontSize: 14,
        color: '#888',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
    billCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    billInfo: {
        flex: 1,
    },
    billDescription: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    billAmount: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 2,
    },
    billDate: {
        fontSize: 12,
        color: '#888',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#666',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
});