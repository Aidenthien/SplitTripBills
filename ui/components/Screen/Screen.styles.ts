import { StyleSheet } from 'react-native';
import type { Theme } from '@/design/theme';

export const createScreenStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        keyboardAvoidingView: {
            flex: 1,
        },

        scrollView: {
            flex: 1,
        },

        padding: {
            padding: theme.layout.screenPadding,
            paddingBottom: theme.spacing[12], // Extra bottom padding for better scrolling
        },
    });