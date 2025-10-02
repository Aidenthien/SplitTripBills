import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '@/components/providers/NotificationProvider';
import { Toast } from '@/ui/components/Toast';

export default function NotificationContainer() {
    const { notifications, hideNotification } = useNotification();
    const insets = useSafeAreaInsets();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={hideNotification}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1000,
    },
});