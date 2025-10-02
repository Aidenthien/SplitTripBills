import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import { Text, View } from '@/components/Themed';
import { Trip } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useNotification } from '@/components/providers/NotificationProvider';
import ConfirmationDialog from '@/ui/components/ConfirmationDialog/ConfirmationDialog';

export default function TripRoomsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      if (savedTrips) {
        setTrips(JSON.parse(savedTrips));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const createTrip = async () => {
    if (!tripName.trim()) {
      showError('Please enter a trip name');
      return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: tripName.trim(),
      travelers: [],
      baseCurrency: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
      targetCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
      exchangeRate: 1,
      createdAt: new Date(),
      bills: [],
    };

    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);

    try {
      await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
    } catch (error) {
      console.error('Error saving trip:', error);
    }

    setTripName('');
    setModalVisible(false);
    showSuccess('Trip created successfully!');

    // Navigate to trip setup
    router.push({
      pathname: '/trip-setup',
      params: { tripId: newTrip.id }
    });
  };

  const confirmDeleteTrip = (tripId: string) => {
    setTripToDelete(tripId);
    setDeleteDialogVisible(true);
  };

  const deleteTrip = async () => {
    if (!tripToDelete) return;

    const updatedTrips = trips.filter(trip => trip.id !== tripToDelete);
    setTrips(updatedTrips);
    try {
      await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
      showSuccess('Trip deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      showError('Failed to delete trip');
    }

    setDeleteDialogVisible(false);
    setTripToDelete(null);
  };

  const openTrip = (trip: Trip) => {
    if (trip.travelers.length === 0) {
      // Need to setup trip first
      router.push({
        pathname: '/trip-setup',
        params: { tripId: trip.id }
      });
    } else {
      // Go to trip dashboard
      router.push({
        pathname: '/trip-dashboard',
        params: { tripId: trip.id }
      });
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => {
    const isSetupComplete = item.travelers.length > 0;

    return (
      <TouchableOpacity
        style={[
          styles.tripCard,
          { backgroundColor: Colors[colorScheme ?? 'light'].background }
        ]}
        onPress={() => openTrip(item)}
      >
        <View style={styles.tripCardContent}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripName}>{item.name}</Text>
            <Text style={styles.tripStatus}>
              {isSetupComplete
                ? `${item.travelers.length} travelers • ${item.bills.length} bills`
                : 'Setup required'
              }
            </Text>
            {isSetupComplete && (
              <Text style={styles.currencyInfo}>
                {item.baseCurrency.code} → {item.targetCurrency.code} (Rate: {item.exchangeRate})
              </Text>
            )}
          </View>
          <View style={styles.tripActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => confirmDeleteTrip(item.id)}
            >
              <FontAwesome name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[
          styles.statusIndicator,
          { backgroundColor: isSetupComplete ? '#4CAF50' : '#ff9800' }
        ]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={styles.title}>My Trip Rooms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="plane" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No trip rooms yet</Text>
          <Text style={styles.emptySubtext}>Create your first trip to get started</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[
            styles.modalContent,
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]}>
            <Text style={styles.modalTitle}>Create New Trip</Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].text
                }
              ]}
              placeholder="Trip name (e.g., Korea 2024, Japan Trip)"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
              value={tripName}
              onChangeText={setTripName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0'
                }]}
                onPress={() => {
                  setModalVisible(false);
                  setTripName('');
                }}
              >
                <Text style={[styles.cancelButtonText, {
                  color: Colors[colorScheme ?? 'light'].text
                }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={createTrip}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmationDialog
        visible={deleteDialogVisible}
        title="Delete Trip"
        message={`Are you sure you want to delete this trip? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="destructive"
        onConfirm={deleteTrip}
        onCancel={() => {
          setDeleteDialogVisible(false);
          setTripToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  tripCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  tripCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  currencyInfo: {
    fontSize: 12,
    color: '#888',
  },
  tripActions: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
  },
  statusIndicator: {
    height: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
