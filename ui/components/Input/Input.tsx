import React, { forwardRef, useRef } from 'react';
import {
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
    TextStyle,
    ScrollView,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { createInputStyles } from './Input.styles';

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helper?: string;
    variant?: 'default' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    scrollViewRef?: React.RefObject<ScrollView>;
}

export default forwardRef<TextInput, InputProps>(function Input({
    label,
    error,
    helper,
    variant = 'outlined',
    size = 'md',
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
    labelStyle,
    scrollViewRef,
    onFocus,
    ...props
}, ref) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createInputStyles(theme);
    const containerRef = useRef<View>(null);

    const handleFocus = (e: any) => {
        // Auto-scroll to input when focused
        if (scrollViewRef?.current && containerRef.current) {
            setTimeout(() => {
                containerRef.current?.measureInWindow((x, y) => {
                    scrollViewRef.current?.scrollTo({
                        y: Math.max(0, y - 100),
                        animated: true,
                    });
                });
            }, 300);
        }
        onFocus?.(e);
    };

    const getInputContainerStyle = () => {
        const baseStyle = [styles.inputContainer, styles[variant], styles[size]];

        if (error) baseStyle.push(styles.error);
        if (props.editable === false) baseStyle.push(styles.disabled);

        return baseStyle;
    };

    return (
        <View ref={containerRef} style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, labelStyle]}>{label}</Text>
            )}

            <View style={getInputContainerStyle()}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    ref={ref}
                    style={[styles.input, inputStyle]}
                    placeholderTextColor={theme.colors.placeholder}
                    onFocus={handleFocus}
                    {...props}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {helper && !error && (
                <Text style={styles.helperText}>{helper}</Text>
            )}
        </View>
    );
});