/**
 * Custom hook for API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiFunction, options = {}) => {
    const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Success!',
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiFunction(...args);
            setData(result);

            if (showSuccessToast) {
                toast.success(successMessage);
            }

            if (onSuccess) {
                onSuccess(result);
            }

            return { success: true, data: result };
        } catch (err) {
            const errorMessage = err.displayMessage || 'An error occurred';
            setError(errorMessage);

            if (showErrorToast) {
                toast.error(errorMessage);
            }

            if (onError) {
                onError(err);
            }

            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [apiFunction, showSuccessToast, showErrorToast, successMessage, onSuccess, onError]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        data,
        error,
        isLoading,
        execute,
        reset,
    };
};

export default useApi;
