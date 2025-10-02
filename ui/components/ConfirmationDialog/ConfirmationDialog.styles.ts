import { StyleSheet } from 'react-native';
import type { Theme } from '@/design/theme';

export const createConfirmationDialogStyles = (theme: Theme) =>
    StyleSheet.create({
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001,
        },

        dialog: {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[6],
            marginHorizontal: theme.spacing[6],
            maxWidth: 400,
            width: '100%',
            ...theme.shadows.lg,
        },

        iconContainer: {
            alignItems: 'center',
            marginBottom: theme.spacing[4],
        },

        title: {
            ...theme.typography.h3,
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing[3],
        },

        message: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: theme.spacing[6],
        },

        buttons: {
            flexDirection: 'row',
            gap: theme.spacing[3],
        },

        cancelButton: {
            flex: 1,
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[4],
            borderRadius: theme.borderRadius.base,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },

        confirmButton: {
            flex: 1,
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[4],
            borderRadius: theme.borderRadius.base,
            backgroundColor: theme.colors.primary,
        },

        destructiveButton: {
            backgroundColor: theme.colors.error,
        },

        warningButton: {
            backgroundColor: theme.colors.warning,
        },

        cancelText: {
            ...theme.typography.button,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },

        confirmText: {
            ...theme.typography.button,
            color: theme.colors.background,
            textAlign: 'center',
        },

        destructiveText: {
            color: theme.colors.background,
        },

        warningText: {
            color: theme.colors.background,
        },
    });