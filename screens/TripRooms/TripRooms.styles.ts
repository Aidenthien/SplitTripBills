import { StyleSheet } from 'react-native';
import type { Theme } from '@/design/theme';

export const createTripRoomsStyles = (theme: Theme) =>
    StyleSheet.create({
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing[6],
        },

        headerSubtitle: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing[2],
        },

        addButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
        },

        listContainer: {
            paddingBottom: theme.spacing[6],
        },

        tripCard: {
            marginBottom: theme.spacing[4],
        },

        tripCardContent: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },

        tripIconContainer: {
            marginRight: theme.spacing[4],
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.surface,
        },

        tripInfo: {
            flex: 1,
            marginRight: theme.spacing[4],
        },

        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing[2],
        },

        deleteButton: {
            padding: theme.spacing[2],
            borderRadius: theme.borderRadius.base,
        },

        statusIndicator: {
            height: 4,
            borderRadius: theme.borderRadius.sm,
            marginTop: theme.spacing[3],
        },

        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing[10],
            paddingVertical: theme.spacing[12],
        },
    });