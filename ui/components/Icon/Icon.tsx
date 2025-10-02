import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';

// Semantic icon mappings for better UX
export const IconMap = {
    // Trip & Travel
    trip: 'plane',
    destination: 'map-marker',
    luggage: 'suitcase',
    passport: 'id-card',

    // Money & Currency
    money: 'money',
    currency: 'exchange',
    calculator: 'calculator',
    receipt: 'file-text-o',
    bill: 'file-text',
    payment: 'credit-card',
    wallet: 'credit-card-alt',

    // People & Users
    user: 'user',
    users: 'users',
    travelers: 'users',
    person: 'user-o',
    group: 'group',

    // Actions
    add: 'plus',
    edit: 'edit',
    delete: 'trash',
    remove: 'times',
    save: 'save',
    cancel: 'times-circle',
    confirm: 'check',
    back: 'arrow-left',
    forward: 'arrow-right',
    up: 'arrow-up',
    down: 'arrow-down',

    // Status & Feedback
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
    loading: 'spinner',

    // Navigation
    home: 'home',
    dashboard: 'tachometer',
    settings: 'cog',
    menu: 'bars',
    search: 'search',
    filter: 'filter',

    // Data
    history: 'history',
    calendar: 'calendar',
    clock: 'clock-o',
    list: 'list',
    grid: 'th',

    // Communication
    notification: 'bell',
    message: 'comment',
    email: 'envelope',
    phone: 'phone',

    // UI Elements
    close: 'times',
    minimize: 'minus',
    maximize: 'expand',
    eye: 'eye',
    eyeOff: 'eye-slash',
    lock: 'lock',
    unlock: 'unlock',

    // Misc
    star: 'star',
    heart: 'heart',
    share: 'share',
    download: 'download',
    upload: 'upload',
    refresh: 'refresh',
    sync: 'refresh',
} as const;

export type IconName = keyof typeof IconMap;

export interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: any;
    onPress?: () => void;
}

export default function Icon({
    name,
    size = 20,
    color,
    style,
    onPress
}: IconProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];

    const iconName = IconMap[name];
    const iconColor = color || theme.colors.text;

    if (onPress) {
        return (
            <FontAwesome
                name={iconName}
                size={size}
                color={iconColor}
                style={[{ padding: 4 }, style]}
                onPress={onPress}
            />
        );
    }

    return (
        <FontAwesome
            name={iconName}
            size={size}
            color={iconColor}
            style={style}
        />
    );
}