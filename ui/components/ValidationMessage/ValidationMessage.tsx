import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { Icon } from '@/ui/components/Icon';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';

export type ValidationMessageType = 'error' | 'warning' | 'success' | 'info';

export interface ValidationMessageProps {
    type: ValidationMessageType;
    message: string;
    visible?: boolean;
    style?: any;
}

export default function ValidationMessage({
    type,
    message,
    visible = true,
    style,
}: ValidationMessageProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];

    if (!visible || !message) {
        return null;
    }

    const getIcon = () => {
        switch (type) {
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'success':
                return 'success';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'error':
                return theme.colors.error;
            case 'warning':
                return theme.colors.warning;
            case 'success':
                return theme.colors.success;
            case 'info':
                return theme.colors.info;
            default:
                return theme.colors.info;
        }
    };

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing[2],
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
            borderRadius: theme.borderRadius.base,
            backgroundColor: type === 'error' ? theme.colors.errorLight :
                type === 'warning' ? theme.colors.warningLight :
                    type === 'success' ? theme.colors.successLight :
                        theme.colors.infoLight,
        },
        icon: {
            marginRight: theme.spacing[2],
        },
        message: {
            ...theme.typography.bodySmall,
            color: getColor(),
            flex: 1,
        },
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.icon}>
                <Icon name={getIcon()} size={16} color={getColor()} />
            </View>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}