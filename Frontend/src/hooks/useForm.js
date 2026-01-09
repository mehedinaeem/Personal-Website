/**
 * Custom hook for form handling with validation
 */

import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = useCallback((fieldName, value) => {
        const rules = validationRules[fieldName];
        if (!rules) return '';

        for (const rule of rules) {
            const error = rule(value, values);
            if (error) return error;
        }
        return '';
    }, [validationRules, values]);

    const validateAll = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach((fieldName) => {
            const error = validate(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validate, values, validationRules]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked, files } = e.target;
        const newValue = type === 'checkbox' ? checked : type === 'file' ? files[0] : value;

        setValues((prev) => ({ ...prev, [name]: newValue }));

        // Clear error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validate(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    }, [validate]);

    const setValue = useCallback((name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    const setFieldError = useCallback((name, error) => {
        setErrors((prev) => ({ ...prev, [name]: error }));
    }, []);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const handleSubmit = useCallback((onSubmit) => async (e) => {
        e.preventDefault();

        // Touch all fields
        const allTouched = Object.keys(validationRules).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Validate all fields
        if (!validateAll()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    }, [validateAll, values, validationRules]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setValue,
        setFieldError,
        reset,
        validateAll,
    };
};

// Common validation rules
export const validators = {
    required: (message = 'This field is required') => (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return message;
        }
        return '';
    },

    email: (message = 'Please enter a valid email') => (value) => {
        if (!value) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return message;
        }
        return '';
    },

    minLength: (min, message) => (value) => {
        if (!value) return '';
        if (value.length < min) {
            return message || `Must be at least ${min} characters`;
        }
        return '';
    },

    maxLength: (max, message) => (value) => {
        if (!value) return '';
        if (value.length > max) {
            return message || `Must be at most ${max} characters`;
        }
        return '';
    },

    pattern: (regex, message = 'Invalid format') => (value) => {
        if (!value) return '';
        if (!regex.test(value)) {
            return message;
        }
        return '';
    },

    url: (message = 'Please enter a valid URL') => (value) => {
        if (!value) return '';
        try {
            new URL(value);
            return '';
        } catch {
            return message;
        }
    },
};

export default useForm;
