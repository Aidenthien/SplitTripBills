import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
        label: string;
        onPress: () => void;
        style?: 'default' | 'destructive';
    }>;
}

interface NotificationContextValue {
    notifications: NotificationData[];
    showNotification: (notification: Omit<NotificationData, 'id'>) => void;
    hideNotification: (id: string) => void;
    clearAll: () => void;

    // Convenience methods
    showSuccess: (title: string, message?: string, duration?: number) => void;
    showError: (title: string, message?: string, duration?: number) => void;
    showWarning: (title: string, message?: string, duration?: number) => void;
    showInfo: (title: string, message?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newNotification: NotificationData = {
            id,
            duration: 4000, // Default 4 seconds
            ...notification,
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-hide after duration
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                hideNotification(id);
            }, newNotification.duration);
        }
    }, []);

    const hideNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
        showNotification({ type: 'success', title, message, duration });
    }, [showNotification]);

    const showError = useCallback((title: string, message?: string, duration?: number) => {
        showNotification({ type: 'error', title, message, duration });
    }, [showNotification]);

    const showWarning = useCallback((title: string, message?: string, duration?: number) => {
        showNotification({ type: 'warning', title, message, duration });
    }, [showNotification]);

    const showInfo = useCallback((title: string, message?: string, duration?: number) => {
        showNotification({ type: 'info', title, message, duration });
    }, [showNotification]);

    const value: NotificationContextValue = {
        notifications,
        showNotification,
        hideNotification,
        clearAll,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};