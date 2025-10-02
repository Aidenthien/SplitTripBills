import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface UseFormValidationProps<T> {
    initialValues: T;
    validationRules: {
        [K in keyof T]?: (value: T[K]) => string | null;
    };
    onSubmit: (values: T) => Promise<void> | void;
}

export const useFormValidation = <T extends Record<string, any>>({
    initialValues,
    validationRules,
    onSubmit,
}: UseFormValidationProps<T>) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [loading, setLoading] = useState(false);

    const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const validateField = useCallback((field: keyof T): boolean => {
        const rule = validationRules[field];
        if (!rule) return true;

        const error = rule(values[field]);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return false;
        }

        setErrors(prev => ({ ...prev, [field]: undefined }));
        return true;
    }, [values, validationRules]);

    const validateAll = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        Object.keys(validationRules).forEach(field => {
            const key = field as keyof T;
            const rule = validationRules[key];
            if (rule) {
                const error = rule(values[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [values, validationRules]);

    const handleSubmit = useCallback(async () => {
        if (!validateAll()) {
            Alert.alert('Validation Error', 'Please fix the errors before continuing.');
            return;
        }

        try {
            setLoading(true);
            await onSubmit(values);
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    }, [values, validateAll, onSubmit]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setLoading(false);
    }, [initialValues]);

    const hasErrors = Object.values(errors).some(error => !!error);

    return {
        values,
        errors,
        loading,
        hasErrors,
        setValue,
        validateField,
        validateAll,
        handleSubmit,
        reset,
    };
};