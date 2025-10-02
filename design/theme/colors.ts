/**
 * Design System - Colors
 * Centralized color definitions following design system principles
 */

export const BaseColors = {
    // Primary Blues
    blue50: '#EBF8FF',
    blue100: '#BEE3F8',
    blue500: '#007AFF',
    blue600: '#0A84FF',
    blue700: '#1e3a8a',

    // Grays
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // System Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Status Colors
    success: '#4CAF50',
    successLight: '#E8F5E8',
    warning: '#FF9800',
    warningLight: '#FFF3E0',
    error: '#FF3B30',
    errorLight: '#FFEBEE',
    info: '#2196F3',
    infoLight: '#E3F2FD',

    // Surface Colors
    surface: '#F2F2F7',
    surfaceDark: '#2C2C2E',
    card: '#FFFFFF',
    cardDark: '#1C1C1E',
};

export const LightTheme = {
    text: BaseColors.black,
    textSecondary: BaseColors.gray600,
    textTertiary: BaseColors.gray500,
    background: BaseColors.white,
    surface: BaseColors.surface,
    card: BaseColors.card,
    border: BaseColors.gray200,
    borderFocus: BaseColors.blue500,
    primary: BaseColors.blue500,
    primaryHover: BaseColors.blue600,
    secondary: BaseColors.gray500,
    placeholder: BaseColors.gray400,
    shadow: BaseColors.gray900,
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Status
    success: BaseColors.success,
    successLight: BaseColors.successLight,
    warning: BaseColors.warning,
    warningLight: BaseColors.warningLight,
    error: BaseColors.error,
    errorLight: BaseColors.errorLight,
    info: BaseColors.info,
    infoLight: BaseColors.infoLight,

    // Interactive
    tabIconDefault: BaseColors.gray400,
    tabIconSelected: BaseColors.blue500,
    tint: BaseColors.blue500,
};

export const DarkTheme = {
    text: BaseColors.white,
    textSecondary: BaseColors.gray300,
    textTertiary: BaseColors.gray400,
    background: BaseColors.black,
    surface: BaseColors.surfaceDark,
    card: BaseColors.cardDark,
    border: BaseColors.gray700,
    borderFocus: BaseColors.blue600,
    primary: BaseColors.blue600,
    primaryHover: BaseColors.blue700,
    secondary: BaseColors.gray400,
    placeholder: BaseColors.gray500,
    shadow: BaseColors.black,
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Status
    success: BaseColors.success,
    successLight: BaseColors.successLight,
    warning: BaseColors.warning,
    warningLight: BaseColors.warningLight,
    error: '#FF453A',
    errorLight: BaseColors.errorLight,
    info: BaseColors.info,
    infoLight: BaseColors.infoLight,

    // Interactive
    tabIconDefault: BaseColors.gray500,
    tabIconSelected: BaseColors.blue600,
    tint: BaseColors.blue600,
};

export type ThemeColors = typeof LightTheme;

export default {
    light: LightTheme,
    dark: DarkTheme,
};