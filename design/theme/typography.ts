/**
 * Design System - Typography
 * Centralized typography scale and text styles
 */

export const FontWeights = {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
} as const;

export const FontSizes = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
} as const;

export const LineHeights = {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
} as const;

export const TextStyles = {
    // Headers
    h1: {
        fontSize: FontSizes['3xl'],
        fontWeight: FontWeights.bold,
        lineHeight: LineHeights.tight,
    },
    h2: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        lineHeight: LineHeights.tight,
    },
    h3: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.semibold,
        lineHeight: LineHeights.snug,
    },
    h4: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        lineHeight: LineHeights.snug,
    },

    // Body Text
    bodyLarge: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.normal,
        lineHeight: LineHeights.normal,
    },
    body: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.normal,
        lineHeight: LineHeights.normal,
    },
    bodySmall: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.normal,
        lineHeight: LineHeights.normal,
    },

    // Labels & Captions
    label: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
        lineHeight: LineHeights.snug,
    },
    caption: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.normal,
        lineHeight: LineHeights.normal,
    },

    // Interactive Elements
    button: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.semibold,
        lineHeight: LineHeights.none,
    },
    link: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.medium,
        lineHeight: LineHeights.normal,
    },

    // Input Elements
    input: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.normal,
        lineHeight: LineHeights.normal,
    },
    placeholder: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.normal,
        lineHeight: LineHeights.normal,
    },
} as const;

export type TextStyleKey = keyof typeof TextStyles;