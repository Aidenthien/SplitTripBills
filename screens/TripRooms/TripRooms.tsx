import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import { Screen, Card, Button, Icon, ValidationMessage } from '@/ui/components';
import { Text, View } from '@/components/Themed';
import { useNotification } from '@/components/business';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { createTripRoomsStyles } from './TripRooms.styles';

// Mock data for demonstration
const mockTrips = [
    {
        id: '1',
        name: 'Korea Adventure 2024',
        travelers: ['John', 'Sarah', 'Mike'],
        bills: [{ id: '1' }, { id: '2' }],
        baseCurrency: { code: 'MYR' },
        targetCurrency: { code: 'KRW' },
        exchangeRate: 331.65,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'Japan Trip',
        travelers: [],
        bills: [],
        baseCurrency: { code: 'MYR' },
        targetCurrency: { code: 'JPY' },
        exchangeRate: 1,
        createdAt: new Date('2024-01-20'),
    },
];

export default function TripRoomsScreen() {
    const { showSuccess, showInfo } = useNotification();
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createTripRoomsStyles(theme);

    const renderTripCard = ({ item }: { item: any }) => {
        const isSetupComplete = item.travelers.length > 0;

        return (
            <TouchableOpacity onPress={() => showInfo('Navigation', `Opening ${item.name}`)}>
                <Card variant="elevated" padding="md" containerStyle={styles.tripCard}>
                    <View style={styles.tripCardContent}>
                        <View style={styles.tripIconContainer}>
                            <Icon
                                name="trip"
                                size={32}
                                color={isSetupComplete ? theme.colors.primary : theme.colors.warning}
                            />
                        </View>

                        <View style={styles.tripInfo}>
                            <Text style={theme.typography.h4}>{item.name}</Text>

                            <View style={styles.statusRow}>
                                <Icon
                                    name={isSetupComplete ? "users" : "warning"}
                                    size={14}
                                    color={theme.colors.textSecondary}
                                />
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginLeft: theme.spacing[2] }]}>
                                    {isSetupComplete
                                        ? `${item.travelers.length} travelers • ${item.bills.length} bills`
                                        : 'Setup required'
                                    }
                                </Text>
                            </View>

                            {isSetupComplete && (
                                <View style={styles.statusRow}>
                                    <Icon name="currency" size={14} color={theme.colors.textTertiary} />
                                    <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, marginLeft: theme.spacing[2] }]}>
                                        {item.baseCurrency.code} → {item.targetCurrency.code} (Rate: {item.exchangeRate})
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => showSuccess('Deleted', `${item.name} removed`)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="delete" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: isSetupComplete ? theme.colors.success : theme.colors.warning }
                    ]} />
                </Card>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="trip" size={64} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.h3, { color: theme.colors.textSecondary, marginTop: theme.spacing[4] }]}>
                No trip rooms yet
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.spacing[2] }]}>
                Create your first trip to get started
            </Text>
            <Button
                title="Create Trip"
                variant="primary"
                size="lg"
                leftIcon={<Icon name="add" size={20} color={theme.colors.background} />}
                containerStyle={{ marginTop: theme.spacing[6] }}
                onPress={() => showInfo('Coming Soon', 'Trip creation will be available soon!')}
            />
        </View>
    );

    return (
        <Screen scrollable padding>
            <View style={styles.header}>
                <View>
                    <Text style={theme.typography.h2}>My Trip Rooms</Text>
                    <View style={styles.headerSubtitle}>
                        <Icon name="trip" size={16} color={theme.colors.textSecondary} />
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginLeft: theme.spacing[2] }]}>
                            {mockTrips.length} {mockTrips.length === 1 ? 'trip' : 'trips'}
                        </Text>
                    </View>
                </View>

                <Button
                    title=""
                    variant="primary"
                    size="sm"
                    rightIcon={<Icon name="add" size={20} color={theme.colors.background} />}
                    containerStyle={styles.addButton}
                    onPress={() => showInfo('Coming Soon', 'Trip creation will be available soon!')}
                />
            </View>

            <ValidationMessage
                type="info"
                message="🎉 New design with icons and better UX!"
                style={{ marginBottom: theme.spacing[4] }}
            />

            <FlatList
                data={mockTrips}
                renderItem={renderTripCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />
        </Screen>
    );
}