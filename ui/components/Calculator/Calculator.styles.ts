import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '@/design/theme/colors';

const { width } = Dimensions.get('window');

export const createCalculatorStyles = (theme: { colors: ThemeColors }) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 20,
            maxHeight: '80%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
        },
        closeButton: {
            padding: 4,
        },
        rateInfo: {
            padding: 12,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        rateText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textSecondary,
        },
        rateSubText: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.colors.textTertiary,
            marginTop: 2,
        },
        display: {
            padding: 20,
            alignItems: 'flex-end',
            minHeight: 80,
            justifyContent: 'center',
            backgroundColor: theme.colors.surface,
        },
        displayText: {
            fontSize: 32,
            fontWeight: '300',
            color: theme.colors.text,
        },
        conversionRow: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingBottom: 10,
            gap: 10,
        },
        conversionButton: {
            width: '100%',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        conversionButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        buttonGrid: {
            paddingHorizontal: 20,
        },
        row: {
            flexDirection: 'row',
            marginBottom: 10,
            gap: 10,
        },
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 50,
            borderRadius: 8,
        },
        buttonText: {
            fontSize: 18,
            fontWeight: '500',
        },
        numberButton: {
            flex: 1,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        operatorButton: {
            flex: 1,
            backgroundColor: theme.colors.secondary,
        },
        operatorButtonText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.background,
        },
        equalsButton: {
            flex: 1,
            backgroundColor: theme.colors.primary,
        },
        zeroButton: {
            flex: 2,
            marginRight: 10,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
    });