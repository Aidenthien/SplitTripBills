/**
 * Design System - Main Theme Export
 * Central theme configuration and utilities
 */

import Colors, { LightTheme, DarkTheme, ThemeColors } from './colors';
import { TextStyles, FontSizes, FontWeights, LineHeights } from './typography';
import { Spacing, BorderRadius, Shadows, Layout } from './spacing';
import { AnimationDuration, AnimationEasing, SlideAnimation, FadeAnimation, ScaleAnimation } from './animations';

export interface Theme {
    colors: ThemeColors;
    typography: typeof TextStyles;
    spacing: typeof Spacing;
    borderRadius: typeof BorderRadius;
    shadows: typeof Shadows;
    layout: typeof Layout;
    animations: {
        duration: typeof AnimationDuration;
        easing: typeof AnimationEasing;
        slide: typeof SlideAnimation;
        fade: typeof FadeAnimation;
        scale: typeof ScaleAnimation;
    };
}

export const lightTheme: Theme = {
    colors: LightTheme,
    typography: TextStyles,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    layout: Layout,
    animations: {
        duration: AnimationDuration,
        easing: AnimationEasing,
        slide: SlideAnimation,
        fade: FadeAnimation,
        scale: ScaleAnimation,
    },
};

export const darkTheme: Theme = {
    colors: DarkTheme,
    typography: TextStyles,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    layout: Layout,
    animations: {
        duration: AnimationDuration,
        easing: AnimationEasing,
        slide: SlideAnimation,
        fade: FadeAnimation,
        scale: ScaleAnimation,
    },
};

export const themes = {
    light: lightTheme,
    dark: darkTheme,
};

// Re-export for convenience
export {
    Colors,
    LightTheme,
    DarkTheme,
    TextStyles,
    FontSizes,
    FontWeights,
    LineHeights,
    Spacing,
    BorderRadius,
    Shadows,
    Layout,
    AnimationDuration,
    AnimationEasing,
    SlideAnimation,
    FadeAnimation,
    ScaleAnimation,
};

export type ThemeMode = keyof typeof themes;
export type { ThemeColors };