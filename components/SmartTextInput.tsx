import React, { useRef } from 'react';
import {
    TextInput,
    TextInputProps,
    StyleSheet,
    View,
    ScrollView,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface SmartTextInputProps extends TextInputProps {
    scrollViewRef?: React.RefObject<ScrollView>;
    containerStyle?: any;
}

export default function SmartTextInput({
    scrollViewRef,
    containerStyle,
    style,
    ...props
}: SmartTextInputProps) {
    const inputRef = useRef<TextInput>(null);
    const containerRef = useRef<View>(null);
    const colorScheme = useColorScheme();

    const handleFocus = (e: any) => {
        // Scroll to input when focused
        if (scrollViewRef?.current && containerRef.current) {
            setTimeout(() => {
                containerRef.current?.measureInWindow((x, y, width, height) => {
                    scrollViewRef.current?.scrollTo({
                        y: Math.max(0, y - 100),
                        animated: true,
                    });
                });
            }, 300); // Wait for keyboard animation
        }
        props.onFocus?.(e);
    };

    return (
        <View ref={containerRef} style={containerStyle}>
            <TextInput
                ref={inputRef}
                style={[
                    styles.input,
                    {
                        color: Colors[colorScheme ?? 'light'].text,
                        borderColor: Colors[colorScheme ?? 'light'].border,
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    style,
                ]}
                placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder}
                {...props}
                onFocus={handleFocus}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
});