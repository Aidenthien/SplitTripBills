import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { createCardStyles } from './Card.styles';

export interface CardProps extends ViewProps {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    containerStyle?: ViewStyle;
}

export default function Card({
    variant = 'default',
    padding = 'md',
    children,
    containerStyle,
    style,
    ...props
}: CardProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createCardStyles(theme);

    const getCardStyle = () => {
        const baseStyle = [styles.base];

        baseStyle.push(styles[variant]);
        baseStyle.push(styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles]);

        return baseStyle;
    };

    return (
        <View style={[getCardStyle(), containerStyle, style]} {...props}>
            {children}
        </View>
    );
}