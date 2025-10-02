import React from 'react';
import {
    TouchableOpacity,
    TouchableOpacityProps,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { createButtonStyles } from './Button.styles';

export interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    containerStyle,
    textStyle,
    disabled,
    ...props
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createButtonStyles(theme);

    const getButtonStyle = () => {
        const baseStyle = [styles.base, styles[size]];

        if (fullWidth) baseStyle.push(styles.fullWidth);
        if (disabled || loading) baseStyle.push(styles.disabled);

        baseStyle.push(styles[variant]);

        return baseStyle;
    };

    const getTextStyle = () => {
        const baseStyle = [styles.text, styles[`${size}Text` as keyof typeof styles]];
        baseStyle.push(styles[`${variant}Text` as keyof typeof styles]);

        if (disabled || loading) baseStyle.push(styles.disabledText);

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), containerStyle]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? theme.colors.background : theme.colors.primary}
                />
            ) : (
                <>
                    {leftIcon}
                    <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                    {rightIcon}
                </>
            )}
        </TouchableOpacity>
    );
}