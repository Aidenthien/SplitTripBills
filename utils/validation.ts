/**
 * Form validation utility functions
 */

export const validationRules = {
    required: (value: any) => {
        if (value === null || value === undefined) {
            return 'This field is required';
        }
        if (typeof value === 'string' && value.trim() === '') {
            return 'This field is required';
        }
        if (Array.isArray(value) && value.length === 0) {
            return 'This field is required';
        }
        return null;
    },

    minLength: (min: number) => (value: string) => {
        if (value && value.length < min) {
            return `Must be at least ${min} characters`;
        }
        return null;
    },

    maxLength: (max: number) => (value: string) => {
        if (value && value.length > max) {
            return `Must be no more than ${max} characters`;
        }
        return null;
    },

    email: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },

    numeric: (value: string) => {
        if (value && !/^\d*\.?\d+$/.test(value)) {
            return 'Please enter a valid number';
        }
        return null;
    },

    positiveNumber: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num <= 0) {
            return 'Must be a positive number';
        }
        return null;
    },

    minValue: (min: number) => (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(num) && num < min) {
            return `Must be at least ${min}`;
        }
        return null;
    },

    maxValue: (max: number) => (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(num) && num > max) {
            return `Must be no more than ${max}`;
        }
        return null;
    },
};

export const combineValidators = (...validators: Array<(value: any) => string | null>) => {
    return (value: any) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) {
                return error;
            }
        }
        return null;
    };
};

export const createFieldValidator = (rules: Array<(value: any) => string | null>) => {
    return combineValidators(...rules);
};