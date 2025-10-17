import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Bill, Traveler } from '@/types';

interface TripContextValue {
    trips: Trip[];
    loading: boolean;
    error: string | null;

    // Trip operations
    createTrip: (name: string) => Promise<Trip>;
    updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
    deleteTrip: (tripId: string) => Promise<void>;
    getTrip: (tripId: string) => Trip | undefined;

    // Bill operations
    createBill: (tripId: string, bill: Omit<Bill, 'id' | 'createdAt'>) => Promise<Bill>;
    updateBill: (tripId: string, billId: string, updates: Partial<Bill>) => Promise<void>;
    deleteBill: (tripId: string, billId: string) => Promise<void>;

    // Data operations
    loadTrips: () => Promise<void>;
    clearAllData: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export const useTripContext = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTripContext must be used within a TripProvider');
    }
    return context;
};

interface TripProviderProps {
    children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load trips from AsyncStorage
    const loadTrips = async () => {
        try {
            setLoading(true);
            setError(null);
            const savedTrips = await AsyncStorage.getItem('trips');
            if (savedTrips) {
                const parsedTrips = JSON.parse(savedTrips);
                setTrips(parsedTrips);
            }
        } catch (err) {
            setError('Failed to load trips');
            console.error('Error loading trips:', err);
        } finally {
            setLoading(false);
        }
    };

    // Save trips to AsyncStorage
    const saveTrips = async (updatedTrips: Trip[]) => {
        try {
            await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
            setTrips(updatedTrips);
        } catch (err) {
            setError('Failed to save trips');
            console.error('Error saving trips:', err);
            throw err;
        }
    };

    // Create a new trip
    const createTrip = async (name: string): Promise<Trip> => {
        try {
            const newTrip: Trip = {
                id: Date.now().toString(),
                name: name.trim(),
                travelers: [],
                baseCurrency: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
                targetCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
                exchangeRate: 0, // Deprecated, kept for backward compatibility
                cardExchangeRate: 0,
                cashExchangeRate: 0,
                createdAt: new Date(),
                bills: [],
            };

            const updatedTrips = [...trips, newTrip];
            await saveTrips(updatedTrips);
            return newTrip;
        } catch (err) {
            setError('Failed to create trip');
            throw err;
        }
    };

    // Update an existing trip
    const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
        try {
            const updatedTrips = trips.map(trip =>
                trip.id === tripId ? { ...trip, ...updates } : trip
            );
            await saveTrips(updatedTrips);
        } catch (err) {
            setError('Failed to update trip');
            throw err;
        }
    };

    // Delete a trip
    const deleteTrip = async (tripId: string) => {
        try {
            const updatedTrips = trips.filter(trip => trip.id !== tripId);
            await saveTrips(updatedTrips);
        } catch (err) {
            setError('Failed to delete trip');
            throw err;
        }
    };

    // Get a specific trip
    const getTrip = (tripId: string) => {
        return trips.find(trip => trip.id === tripId);
    };

    // Create a new bill
    const createBill = async (tripId: string, billData: Omit<Bill, 'id' | 'createdAt'>): Promise<Bill> => {
        try {
            const newBill: Bill = {
                ...billData,
                id: Date.now().toString(),
                createdAt: new Date(),
            };

            const updatedTrips = trips.map(trip => {
                if (trip.id === tripId) {
                    return {
                        ...trip,
                        bills: [...trip.bills, newBill],
                    };
                }
                return trip;
            });

            await saveTrips(updatedTrips);
            return newBill;
        } catch (err) {
            setError('Failed to create bill');
            throw err;
        }
    };

    // Update a bill
    const updateBill = async (tripId: string, billId: string, updates: Partial<Bill>) => {
        try {
            const updatedTrips = trips.map(trip => {
                if (trip.id === tripId) {
                    return {
                        ...trip,
                        bills: trip.bills.map(bill =>
                            bill.id === billId ? { ...bill, ...updates } : bill
                        ),
                    };
                }
                return trip;
            });

            await saveTrips(updatedTrips);
        } catch (err) {
            setError('Failed to update bill');
            throw err;
        }
    };

    // Delete a bill
    const deleteBill = async (tripId: string, billId: string) => {
        try {
            const updatedTrips = trips.map(trip => {
                if (trip.id === tripId) {
                    return {
                        ...trip,
                        bills: trip.bills.filter(bill => bill.id !== billId),
                    };
                }
                return trip;
            });

            await saveTrips(updatedTrips);
        } catch (err) {
            setError('Failed to delete bill');
            throw err;
        }
    };

    // Clear all data
    const clearAllData = async () => {
        try {
            await AsyncStorage.removeItem('trips');
            setTrips([]);
        } catch (err) {
            setError('Failed to clear data');
            throw err;
        }
    };

    // Load trips on mount
    useEffect(() => {
        loadTrips();
    }, []);

    const value: TripContextValue = {
        trips,
        loading,
        error,
        createTrip,
        updateTrip,
        deleteTrip,
        getTrip,
        createBill,
        updateBill,
        deleteBill,
        loadTrips,
        clearAllData,
    };

    return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};