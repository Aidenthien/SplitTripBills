import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '@/design/theme';

export const createToastStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            position: 'absolute',
            left: theme.spacing[4],
            right: theme.spacing[4],
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.card,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 8,
                },
            }),
            // Native-style border
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
        },

        content: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing[4],
            minHeight: 60, // Native-style minimum height
        },

        iconContainer: {
            marginRight: theme.spacing[3],
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },

        textContainer: {
            flex: 1,
            marginRight: theme.spacing[2],
            justifyContent: 'center',
        },

        title: {
            ...theme.typography.body,
            fontWeight: '600',
            color: theme.colors.text,
            lineHeight: 20,
        },

        message: {
            ...theme.typography.bodySmall,
            color: theme.colors.textSecondary,
            lineHeight: 16,
            marginTop: 2,
        },

        closeButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },

        actions: {
            flexDirection: 'row',
            paddingHorizontal: theme.spacing[4],
            paddingBottom: theme.spacing[4],
            paddingTop: 0,
            gap: theme.spacing[3],
        },

        actionButton: {
            paddingVertical: theme.spacing[2],
            paddingHorizontal: theme.spacing[4],
            borderRadius: theme.borderRadius.base,
            backgroundColor: theme.colors.surface,
        },

        destructiveAction: {
            backgroundColor: theme.colors.errorLight,
        },

        actionText: {
            ...theme.typography.label,
            color: theme.colors.primary,
            textAlign: 'center',
        },

        destructiveActionText: {
            color: theme.colors.error,
        },

        // Native-style toast variants
        success: {
            backgroundColor: theme.colors.card,
        },

        error: {
            backgroundColor: theme.colors.card,
        },

        warning: {
            backgroundColor: theme.colors.card,
        },

        info: {
            backgroundColor: theme.colors.card,
        },

        // Icon container variants
        successIcon: {
            backgroundColor: theme.colors.successLight,
        },

        errorIcon: {
            backgroundColor: theme.colors.errorLight,
        },

        warningIcon: {
            backgroundColor: theme.colors.warningLight,
        },

        infoIcon: {
            backgroundColor: theme.colors.infoLight,
        },

        // Progress bar styles
        progressContainer: {
            height: 3,
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: theme.borderRadius.lg,
            borderBottomRightRadius: theme.borderRadius.lg,
            overflow: 'hidden',
        },

        progressBar: {
            height: '100%',
            borderBottomLeftRadius: theme.borderRadius.lg,
            borderBottomRightRadius: theme.borderRadius.lg,
        },
    });