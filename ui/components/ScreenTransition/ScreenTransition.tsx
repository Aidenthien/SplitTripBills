import React, { useEffect, useRef, ReactNode } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface ScreenTransitionProps {
    children: ReactNode;
    animationType?: 'fade' | 'slide' | 'scale';
    duration?: number;
    style?: ViewStyle;
    backgroundColor?: string;
}

export default function ScreenTransition({
    children,
    animationType = 'fade',
    duration = 300,
    style,
    backgroundColor,
}: ScreenTransitionProps) {
    const isFocused = useIsFocused();
    const colorScheme = useColorScheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Get theme-appropriate background color
    const defaultBackgroundColor = backgroundColor || Colors[colorScheme ?? 'light'].background;

    useEffect(() => {
        if (isFocused) {
            // Screen is focused - animate in
            const animations = [];

            switch (animationType) {
                case 'fade':
                    animations.push(
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration,
                            useNativeDriver: true,
                        })
                    );
                    break;
                case 'slide':
                    animations.push(
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: duration * 0.8,
                            useNativeDriver: true,
                        }),
                        Animated.spring(slideAnim, {
                            toValue: 0,
                            tension: 100,
                            friction: 8,
                            useNativeDriver: true,
                        })
                    );
                    break;
                case 'scale':
                    animations.push(
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: duration * 0.8,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            tension: 100,
                            friction: 8,
                            useNativeDriver: true,
                        })
                    );
                    break;
            }

            Animated.parallel(animations).start();
        } else {
            // Screen is unfocused - reset animations
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            scaleAnim.setValue(0.95);
        }
    }, [isFocused, animationType, duration, fadeAnim, slideAnim, scaleAnim]);

    const getAnimatedStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flex: 1,
            opacity: fadeAnim,
            backgroundColor: defaultBackgroundColor,
        };

        switch (animationType) {
            case 'slide':
                return {
                    ...baseStyle,
                    transform: [{ translateY: slideAnim }],
                };
            case 'scale':
                return {
                    ...baseStyle,
                    transform: [{ scale: scaleAnim }],
                };
            default:
                return baseStyle;
        }
    };

    return (
        <Animated.View style={[getAnimatedStyle(), style]}>
            {children}
        </Animated.View>
    );
}