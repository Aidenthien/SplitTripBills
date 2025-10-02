import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    View,
    ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { createScreenStyles } from './Screen.styles';

export interface ScreenProps {
    children: React.ReactNode;
    scrollable?: boolean;
    keyboardAvoiding?: boolean;
    padding?: boolean;
    backgroundColor?: string;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    showsVerticalScrollIndicator?: boolean;
}

export default function Screen({
    children,
    scrollable = false,
    keyboardAvoiding = true,
    padding = true,
    backgroundColor,
    style,
    contentContainerStyle,
    showsVerticalScrollIndicator = false,
}: ScreenProps) {
    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createScreenStyles(theme);

    const screenStyle = [
        styles.container,
        backgroundColor && { backgroundColor },
        style,
    ];

    const contentStyle = [
        padding && styles.padding,
        contentContainerStyle,
    ];

    const renderContent = () => {
        if (scrollable) {
            return (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={contentStyle}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                >
                    {children}
                </ScrollView>
            );
        }

        return (
            <View style={contentStyle}>
                {children}
            </View>
        );
    };

    if (keyboardAvoiding) {
        return (
            <SafeAreaView style={screenStyle}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    {renderContent()}
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={screenStyle}>
            {renderContent()}
        </SafeAreaView>
    );
}