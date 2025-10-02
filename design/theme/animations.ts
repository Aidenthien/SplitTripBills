/**
 * Design System - Animations
 * Animation constants and easing functions
 */

export const AnimationDuration = {
    fast: 200,
    normal: 300,
    slow: 500,
} as const;

export const AnimationEasing = {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
} as const;

export const SlideAnimation = {
    slideInFromTop: {
        from: { opacity: 0, translateY: -50 },
        to: { opacity: 1, translateY: 0 },
    },
    slideInFromBottom: {
        from: { opacity: 0, translateY: 50 },
        to: { opacity: 1, translateY: 0 },
    },
    slideInFromLeft: {
        from: { opacity: 0, translateX: -50 },
        to: { opacity: 1, translateX: 0 },
    },
    slideInFromRight: {
        from: { opacity: 0, translateX: 50 },
        to: { opacity: 1, translateX: 0 },
    },
} as const;

export const FadeAnimation = {
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
    fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
    },
} as const;

export const ScaleAnimation = {
    scaleIn: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 },
    },
    scaleOut: {
        from: { opacity: 1, scale: 1 },
        to: { opacity: 0, scale: 0.8 },
    },
} as const;