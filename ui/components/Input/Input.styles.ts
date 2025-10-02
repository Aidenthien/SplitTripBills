import { StyleSheet } from 'react-native';
import type { Theme } from '@/design/theme';

export const createInputStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            marginBottom: theme.spacing[1],
        },

        label: {
            ...theme.typography.label,
            color: theme.colors.text,
            marginBottom: theme.spacing[2],
        },

        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: theme.borderRadius.base,
            backgroundColor: theme.colors.background,
        },

        // Variants
        default: {
            borderColor: 'transparent',
            backgroundColor: theme.colors.surface,
        },
        outlined: {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
        },
        filled: {
            borderColor: 'transparent',
            backgroundColor: theme.colors.surface,
        },

        // Sizes
        sm: {
            minHeight: 36,
            paddingHorizontal: theme.spacing[3],
        },
        md: {
            minHeight: 44,
            paddingHorizontal: theme.spacing[4],
        },
        lg: {
            minHeight: 52,
            paddingHorizontal: theme.spacing[5],
        },

        // States
        error: {
            borderColor: theme.colors.error,
        },
        disabled: {
            opacity: 0.6,
            backgroundColor: theme.colors.surface,
        },

        input: {
            flex: 1,
            ...theme.typography.input,
            color: theme.colors.text,
            paddingVertical: 0, // Remove default padding
        },

        leftIcon: {
            marginRight: theme.spacing[2],
        },

        rightIcon: {
            marginLeft: theme.spacing[2],
        },

        errorText: {
            ...theme.typography.caption,
            color: theme.colors.error,
            marginTop: theme.spacing[1],
        },

        helperText: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing[1],
        },
    });