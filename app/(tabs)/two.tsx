import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { Trip, Bill } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface BillHistory {
  bill: Bill;
  tripName: string;
  targetCurrency: string;
}

export default function HistoryScreen() {
  const [billHistory, setBillHistory] = useState<BillHistory[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadBillHistory();
  }, []);

  const loadBillHistory = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      if (savedTrips) {
        const trips: Trip[] = JSON.parse(savedTrips);
        const allBills: BillHistory[] = [];

        trips.forEach(trip => {
          trip.bills.forEach(bill => {
            allBills.push({
              bill,
              tripName: trip.name,
              targetCurrency: trip.targetCurrency.symbol
            });
          });
        });

        // Sort by date (newest first)
        allBills.sort((a, b) => new Date(b.bill.createdAt).getTime() - new Date(a.bill.createdAt).getTime());
        setBillHistory(allBills);
      }
    } catch (error) {
      console.error('Error loading bill history:', error);
    }
  };

  const renderBillItem = ({ item }: { item: BillHistory }) => {
    return (
      <View style={[
        styles.billCard,
        { backgroundColor: Colors[colorScheme ?? 'light'].background }
      ]}>
        <View style={styles.billInfo}>
          <Text style={styles.billDescription}>{item.bill.description}</Text>
          <Text style={styles.tripName}>{item.tripName}</Text>
          <Text style={styles.billAmount}>
            {item.targetCurrency}{item.bill.totalAmount.toFixed(2)}
          </Text>
          <Text style={styles.billDate}>
            {new Date(item.bill.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={styles.title}>Bill History</Text>
      </View>

      {billHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="history" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No bills yet</Text>
          <Text style={styles.emptySubtext}>Create some trips and bills to see history</Text>
        </View>
      ) : (
        <FlatList
          data={billHistory}
          renderItem={renderBillItem}
          keyExtractor={(item) => item.bill.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  billCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  billDate: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});
