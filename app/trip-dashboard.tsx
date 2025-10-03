import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Modal,
    ScrollView,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Trip, Bill, BillCategory } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import ScreenTransition from '@/ui/components/ScreenTransition';
import Calculator from '@/ui/components/Calculator';
import { BILL_CATEGORIES } from '@/constants/BillCategories';

export default function TripDashboardScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [calculatorVisible, setCalculatorVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    // iPhone-style date picker states
    const [tempDay, setTempDay] = useState(new Date().getDate());
    const [tempMonth, setTempMonth] = useState(new Date().getMonth());
    const [tempYear, setTempYear] = useState(new Date().getFullYear());
    const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
    const colorScheme = useColorScheme();
    const navigation = useNavigation();

    useEffect(() => {
        loadTrip();
    }, [tripId]);

    // Configure navigation header with calculator button
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setCalculatorVisible(true)}
                    style={{ padding: 8, marginRight: 8 }}
                    disabled={!trip}
                >
                    <FontAwesome
                        name="calculator"
                        size={20}
                        color={!trip ? '#ccc' : (colorScheme === 'dark' ? '#FFFFFF' : '#007AFF')}
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation, trip, colorScheme]);

    // Refresh data when screen comes into focus (e.g., after creating a bill)
    useFocusEffect(
        React.useCallback(() => {
            loadTrip();
        }, [tripId])
    );

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

    const handleCloseCalculator = () => {
        setCalculatorVisible(false);
    };

    // Filter and search logic
    const filteredBills = useMemo(() => {
        if (!trip) return [];

        let filtered = trip.bills;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(bill =>
                bill.description.toLowerCase().includes(query) ||
                bill.category.name.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(bill =>
                selectedCategories.includes(bill.category.id)
            );
        }

        // Apply date filter
        if (startDate || endDate) {
            filtered = filtered.filter(bill => {
                const billDate = new Date(bill.createdAt);
                const billDay = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());

                if (startDate && endDate) {
                    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                    return billDay >= start && billDay <= end;
                } else if (startDate) {
                    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    return billDay >= start;
                } else if (endDate) {
                    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                    return billDay <= end;
                }
                return true;
            });
        }

        // Sort by date (newest first)
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [trip, searchQuery, selectedCategories, startDate, endDate]);

    const toggleCategoryFilter = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategories([]);
        setStartDate(null);
        setEndDate(null);
    };

    const hasActiveFilters = searchQuery.trim() || selectedCategories.length > 0 || startDate || endDate;

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDateRangeText = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        } else if (startDate) {
            return `From ${formatDate(startDate)}`;
        } else if (endDate) {
            return `Until ${formatDate(endDate)}`;
        }
        return null;
    };

    const generateDateOptions = (): Date[] => {
        const dates: Date[] = [];
        const today = new Date();

        // Add past 30 days and future 30 days
        for (let i = 30; i >= -30; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date);
        }

        return dates;
    };

    // iPhone-style date picker helper functions
    const openDatePicker = (isStart: boolean) => {
        setIsSelectingStartDate(isStart);
        const targetDate = isStart ? startDate : endDate;
        if (targetDate) {
            setTempDay(targetDate.getDate());
            setTempMonth(targetDate.getMonth());
            setTempYear(targetDate.getFullYear());
        } else {
            const today = new Date();
            setTempDay(today.getDate());
            setTempMonth(today.getMonth());
            setTempYear(today.getFullYear());
        }
        setShowStartDatePicker(true);
    };

    const confirmDateSelection = () => {
        const selectedDate = new Date(tempYear, tempMonth, tempDay);
        if (isSelectingStartDate) {
            setStartDate(selectedDate);
        } else {
            setEndDate(selectedDate);
        }
        setShowStartDatePicker(false);
    };

    const cancelDateSelection = () => {
        setShowStartDatePicker(false);
    };

    // Generate arrays for picker options
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const generateDays = () => {
        const daysInMonth = getDaysInMonth(tempMonth, tempYear);
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const generateMonths = () => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return months;
    };

    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
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
                    <View style={styles.billHeader}>
                        <View style={[styles.categoryIconSmall, { backgroundColor: item.category.color + '20' }]}>
                            <FontAwesome name={item.category.icon as any} size={14} color={item.category.color} />
                        </View>
                        <Text style={styles.billDescription}>{item.description}</Text>
                    </View>
                    <Text style={styles.billCategory}>{item.category.name}</Text>
                    <Text style={styles.billAmount}>
                        Total: {trip?.targetCurrency.symbol}{item.totalAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.billDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
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
            <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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

                {/* Search and Filter Section */}
                <View style={[styles.searchFilterSection, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={[styles.searchBar, {
                            backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                            borderColor: Colors[colorScheme ?? 'light'].text + '20'
                        }]}>
                            <FontAwesome name="search" size={16} color={Colors[colorScheme ?? 'light'].text + '60'} />
                            <TextInput
                                style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
                                placeholder="Search bills..."
                                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <FontAwesome name="times-circle" size={16} color={Colors[colorScheme ?? 'light'].text + '60'} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Filter Controls */}
                    <View style={styles.filterControls}>
                        <TouchableOpacity
                            style={[styles.filterButton, {
                                backgroundColor: hasActiveFilters ? '#007AFF' : (colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7'),
                                borderColor: Colors[colorScheme ?? 'light'].text + '20'
                            }]}
                            onPress={() => setFilterModalVisible(true)}
                        >
                            <FontAwesome
                                name="filter"
                                size={14}
                                color={hasActiveFilters ? 'white' : Colors[colorScheme ?? 'light'].text + '80'}
                            />
                            <Text style={[styles.filterButtonText, {
                                color: hasActiveFilters ? 'white' : Colors[colorScheme ?? 'light'].text + '80'
                            }]}>Filter</Text>
                            {hasActiveFilters && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>
                                        {(selectedCategories.length + ((startDate || endDate) ? 1 : 0))}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {hasActiveFilters && (
                            <TouchableOpacity
                                style={[styles.clearButton, {
                                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                                    borderColor: Colors[colorScheme ?? 'light'].text + '20'
                                }]}
                                onPress={clearAllFilters}
                            >
                                <FontAwesome name="times" size={12} color={Colors[colorScheme ?? 'light'].text + '80'} />
                                <Text style={[styles.clearButtonText, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
                            {selectedCategories.map(categoryId => {
                                const category = BILL_CATEGORIES.find(c => c.id === categoryId);
                                return category ? (
                                    <View key={categoryId} style={[styles.activeFilterChip, { backgroundColor: category.color + '20' }]}>
                                        <FontAwesome name={category.icon as any} size={10} color={category.color} />
                                        <Text style={[styles.activeFilterText, { color: category.color }]}>{category.name}</Text>
                                    </View>
                                ) : null;
                            })}
                            {(startDate || endDate) && (
                                <View style={[styles.activeFilterChip, { backgroundColor: '#007AFF20' }]}>
                                    <FontAwesome name="calendar" size={10} color="#007AFF" />
                                    <Text style={[styles.activeFilterText, { color: '#007AFF' }]}>
                                        {getDateRangeText()}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Split Bills</Text>
                        <TouchableOpacity style={styles.addButton} onPress={createNewBill}>
                            <FontAwesome name="plus" size={16} color="white" />
                            <Text style={styles.addButtonText}>New Bill</Text>
                        </TouchableOpacity>
                    </View>

                    {filteredBills.length === 0 ? (
                        <View style={styles.emptyState}>
                            <FontAwesome name="file-text-o" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {trip.bills.length === 0 ? 'No bills yet' : 'No bills match your search'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {trip.bills.length === 0 ? 'Create your first split bill' : 'Try adjusting your search or filters'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredBills}
                            renderItem={renderBillCard}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </SafeAreaView>

            {/* Filter Modal */}
            <Modal visible={filterModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].text + '20' }]}>
                            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Filter Bills</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <FontAwesome name="times" size={20} color={Colors[colorScheme ?? 'light'].text + '60'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Date Range Filter */}
                            <View style={styles.filterSection}>
                                <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Date Range</Text>
                                <View style={styles.datePickerContainer}>
                                    <View style={styles.datePickerRow}>
                                        <Text style={[styles.datePickerLabel, { color: Colors[colorScheme ?? 'light'].secondary }]}>From:</Text>
                                        <TouchableOpacity
                                            style={[styles.datePickerButton, {
                                                backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                                                borderColor: Colors[colorScheme ?? 'light'].text + '20'
                                            }]}
                                            onPress={() => openDatePicker(true)}
                                        >
                                            <FontAwesome name="calendar" size={14} color={Colors[colorScheme ?? 'light'].secondary} />
                                            <Text style={[styles.datePickerButtonText, {
                                                color: startDate ? Colors[colorScheme ?? 'light'].text : Colors[colorScheme ?? 'light'].secondary
                                            }]}>
                                                {formatDate(startDate)}
                                            </Text>
                                        </TouchableOpacity>
                                        {startDate && (
                                            <TouchableOpacity onPress={() => setStartDate(null)} style={styles.clearDateButton}>
                                                <FontAwesome name="times-circle" size={16} color={Colors[colorScheme ?? 'light'].secondary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.datePickerRow}>
                                        <Text style={[styles.datePickerLabel, { color: Colors[colorScheme ?? 'light'].secondary }]}>To:</Text>
                                        <TouchableOpacity
                                            style={[styles.datePickerButton, {
                                                backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                                                borderColor: Colors[colorScheme ?? 'light'].text + '20'
                                            }]}
                                            onPress={() => openDatePicker(false)}
                                        >
                                            <FontAwesome name="calendar" size={14} color={Colors[colorScheme ?? 'light'].secondary} />
                                            <Text style={[styles.datePickerButtonText, {
                                                color: endDate ? Colors[colorScheme ?? 'light'].text : Colors[colorScheme ?? 'light'].secondary
                                            }]}>
                                                {formatDate(endDate)}
                                            </Text>
                                        </TouchableOpacity>
                                        {endDate && (
                                            <TouchableOpacity onPress={() => setEndDate(null)} style={styles.clearDateButton}>
                                                <FontAwesome name="times-circle" size={16} color={Colors[colorScheme ?? 'light'].secondary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Category Filter */}
                            <View style={styles.filterSection}>
                                <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Categories</Text>
                                <View style={styles.filterOptions}>
                                    {BILL_CATEGORIES.map(category => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[styles.filterOption, {
                                                backgroundColor: selectedCategories.includes(category.id)
                                                    ? category.color + '20'
                                                    : (colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7'),
                                                borderColor: selectedCategories.includes(category.id) ? category.color : Colors[colorScheme ?? 'light'].text + '20'
                                            }]}
                                            onPress={() => toggleCategoryFilter(category.id)}
                                        >
                                            <FontAwesome
                                                name={selectedCategories.includes(category.id) ? "check-circle" : "circle-o"}
                                                size={16}
                                                color={selectedCategories.includes(category.id) ? category.color : Colors[colorScheme ?? 'light'].text + '60'}
                                            />
                                            <FontAwesome name={category.icon as any} size={14} color={category.color} />
                                            <Text style={[styles.filterOptionText, {
                                                color: selectedCategories.includes(category.id) ? category.color : Colors[colorScheme ?? 'light'].text
                                            }]}>{category.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopColor: Colors[colorScheme ?? 'light'].text + '20' }]}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.clearAllButton, {
                                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                                    borderColor: Colors[colorScheme ?? 'light'].text + '20'
                                }]}
                                onPress={clearAllFilters}
                            >
                                <Text style={[styles.clearAllButtonText, { color: Colors[colorScheme ?? 'light'].text + '80' }]}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.applyButton, { backgroundColor: '#007AFF' }]}
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* iPhone-Style Date Picker Modal */}
            <Modal visible={showStartDatePicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.datePickerModal, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].text + '20' }]}>
                            <TouchableOpacity onPress={cancelDateSelection}>
                                <Text style={[styles.modalCancelText, { color: Colors[colorScheme ?? 'light'].primary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                {isSelectingStartDate ? 'Select Start Date' : 'Select End Date'}
                            </Text>
                            <TouchableOpacity onPress={confirmDateSelection}>
                                <Text style={[styles.modalConfirmText, { color: Colors[colorScheme ?? 'light'].primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerContainer}>
                            {/* Day Picker */}
                            <View style={styles.pickerSection}>
                                <Text style={[styles.pickerLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Day</Text>
                                <ScrollView
                                    style={styles.pickerScrollView}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={50}
                                    decelerationRate="fast"
                                >
                                    {generateDays().map(day => (
                                        <TouchableOpacity
                                            key={day}
                                            style={[styles.pickerItem, {
                                                backgroundColor: tempDay === day ? Colors[colorScheme ?? 'light'].primary + '20' : 'transparent'
                                            }]}
                                            onPress={() => setTempDay(day)}
                                        >
                                            <Text style={[styles.pickerItemText, {
                                                color: tempDay === day ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text,
                                                fontWeight: tempDay === day ? '600' : '400'
                                            }]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Month Picker */}
                            <View style={styles.pickerSection}>
                                <Text style={[styles.pickerLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Month</Text>
                                <ScrollView
                                    style={styles.pickerScrollView}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={50}
                                    decelerationRate="fast"
                                >
                                    {generateMonths().map((month, index) => (
                                        <TouchableOpacity
                                            key={month}
                                            style={[styles.pickerItem, {
                                                backgroundColor: tempMonth === index ? Colors[colorScheme ?? 'light'].primary + '20' : 'transparent'
                                            }]}
                                            onPress={() => setTempMonth(index)}
                                        >
                                            <Text style={[styles.pickerItemText, {
                                                color: tempMonth === index ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text,
                                                fontWeight: tempMonth === index ? '600' : '400'
                                            }]}>
                                                {month}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Year Picker */}
                            <View style={styles.pickerSection}>
                                <Text style={[styles.pickerLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Year</Text>
                                <ScrollView
                                    style={styles.pickerScrollView}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={50}
                                    decelerationRate="fast"
                                >
                                    {generateYears().map(year => (
                                        <TouchableOpacity
                                            key={year}
                                            style={[styles.pickerItem, {
                                                backgroundColor: tempYear === year ? Colors[colorScheme ?? 'light'].primary + '20' : 'transparent'
                                            }]}
                                            onPress={() => setTempYear(year)}
                                        >
                                            <Text style={[styles.pickerItemText, {
                                                color: tempYear === year ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text,
                                                fontWeight: tempYear === year ? '600' : '400'
                                            }]}>
                                                {year}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Calculator Modal */}
            {trip && (
                <Calculator
                    visible={calculatorVisible}
                    onClose={handleCloseCalculator}
                    baseCurrency={trip.baseCurrency}
                    targetCurrency={trip.targetCurrency}
                    exchangeRate={trip.exchangeRate}
                />
            )}
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
    billHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryIconSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    billDescription: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    billCategory: {
        fontSize: 12,
        color: '#888',
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
    // Search and Filter Styles
    searchFilterSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchContainer: {
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    filterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        gap: 6,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterBadge: {
        backgroundColor: 'white',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        gap: 4,
    },
    clearButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    activeFilters: {
        marginTop: 8,
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        gap: 4,
    },
    activeFilterText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
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
    modalBody: {
        maxHeight: 400,
    },
    filterSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    filterOptions: {
        gap: 8,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearAllButton: {
        borderWidth: 1,
    },
    clearAllButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#007AFF',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    // Date Picker Styles
    datePickerContainer: {
        gap: 16,
    },
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    datePickerLabel: {
        fontSize: 14,
        fontWeight: '500',
        minWidth: 40,
    },
    datePickerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    datePickerButtonText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    clearDateButton: {
        padding: 4,
    },
    // Date Picker Modal Styles
    datePickerModal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        minHeight: 400,
    },
    datePickerContent: {
        padding: 20,
    },
    dateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    dateOption: {
        width: '23%',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 8,
    },
    dateOptionText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    // iPhone-Style Date Picker Styles
    modalCancelText: {
        fontSize: 16,
        fontWeight: '400',
    },
    modalConfirmText: {
        fontSize: 16,
        fontWeight: '600',
    },
    pickerContainer: {
        flexDirection: 'row',
        height: 300,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    pickerSection: {
        flex: 1,
        marginHorizontal: 5,
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
    pickerScrollView: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    pickerItem: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginVertical: 2,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    pickerItemText: {
        fontSize: 16,
        textAlign: 'center',
    },
});