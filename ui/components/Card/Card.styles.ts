import { StyleSheet } from 'react-native';
import { StyleSheet } from 'react-native';
import type { Theme } from '@/design/theme';

export const createCardStyles = (theme: Theme) =>
    StyleSheet.create({
        base: {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
        },

        // Variants
        default: {
            ...theme.shadows.base,
        },
        elevated: {
            ...theme.shadows.md,
        },
        outlined: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.none,
        },

        // Padding variants
        paddingNone: {
            padding: 0,
        },
        paddingSm: {
            padding: theme.spacing[3],
        },
        paddingMd: {
            padding: theme.spacing[4],
        },
        paddingLg: {
            padding: theme.spacing[6],
        },
    });