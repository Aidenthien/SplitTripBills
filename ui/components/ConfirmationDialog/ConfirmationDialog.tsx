import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Icon } from '@/ui/components/Icon';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { createConfirmationDialogStyles } from './ConfirmationDialog.styles';

export interface ConfirmationDialogProps {
    visible: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'default' | 'destructive' | 'warning';
    icon?: React.ReactNode;
}

export default function ConfirmationDialog({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'default',
    icon,
}: ConfirmationDialogProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createConfirmationDialogStyles(theme);

    if (!visible) {
        return null;
    }

    const getDefaultIcon = () => {
        switch (type) {
            case 'destructive':
                return <Icon name="warning" size={32} color={theme.colors.error} />;
            case 'warning':
                return <Icon name="warning" size={32} color={theme.colors.warning} />;
            default:
                return <Icon name="info" size={32} color={theme.colors.info} />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'destructive':
                return [styles.confirmButton, styles.destructiveButton];
            case 'warning':
                return [styles.confirmButton, styles.warningButton];
            default:
                return styles.confirmButton;
        }
    };

    const getConfirmTextStyle = () => {
        switch (type) {
            case 'destructive':
                return [styles.confirmText, styles.destructiveText];
            case 'warning':
                return [styles.confirmText, styles.warningText];
            default:
                return styles.confirmText;
        }
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.dialog}>
                {(icon || type !== 'default') && (
                    <View style={styles.iconContainer}>
                        {icon || getDefaultIcon()}
                    </View>
                )}

                <Text style={styles.title}>{title}</Text>

                {message && (
                    <Text style={styles.message}>{message}</Text>
                )}

                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelText}>{cancelText}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getConfirmButtonStyle()}
                        onPress={onConfirm}
                    >
                        <Text style={getConfirmTextStyle()}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}