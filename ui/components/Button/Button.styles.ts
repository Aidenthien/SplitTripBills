import { StyleSheet } from 'react-native';
import type { Theme } from '@/design/theme';

export const createButtonStyles = (theme: Theme) =>
    StyleSheet.create({
        base: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.base,
            borderWidth: 1,
            borderColor: 'transparent',
        },

        // Sizes
        sm: {
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
            minHeight: 36,
        },
        md: {
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
            minHeight: 44,
        },
        lg: {
            paddingHorizontal: theme.spacing[6],
            paddingVertical: theme.spacing[4],
            minHeight: 52,
        },

        // Variants
        primary: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        secondary: {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
        },
        outline: {
            backgroundColor: 'transparent',
            borderColor: theme.colors.primary,
        },
        ghost: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
        },

        // States
        disabled: {
            opacity: 0.5,
        },
        fullWidth: {
            width: '100%',
        },

        // Text styles
        text: {
            ...theme.typography.button,
            textAlign: 'center',
        },
        smText: {
            fontSize: theme.typography.bodySmall.fontSize,
        },
        mdText: {
            fontSize: theme.typography.button.fontSize,
        },
        lgText: {
            fontSize: theme.typography.bodyLarge.fontSize,
        },

        // Text variants
        primaryText: {
            color: theme.colors.background,
        },
        secondaryText: {
            color: theme.colors.text,
        },
        outlineText: {
            color: theme.colors.primary,
        },
        ghostText: {
            color: theme.colors.primary,
        },
        disabledText: {
            opacity: 0.6,
        },
    });