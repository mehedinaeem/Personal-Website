/**
 * Axios instance with interceptors for API calls
 * Handles authentication, error handling, and retries
 */

import axios from 'axios';
import config from '../config';

// Create axios instance
const api = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For httpOnly cookies
    withXSRFToken: true,
});

const refreshClient = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    withCredentials: true,
    withXSRFToken: true,
});

// Token storage (in-memory for security)
let accessToken = null;
let refreshPromise = null;
let csrfToken = null;

// Set access token
export const setAccessToken = (token) => {
    accessToken = token;
};

// Get access token
export const getAccessToken = () => accessToken;

// Clear access token
export const clearAccessToken = () => {
    accessToken = null;
};

export const setCsrfToken = (token) => {
    csrfToken = token;
    refreshClient.defaults.headers.common['X-CSRFToken'] = token;
};

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add authorization header if token exists
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        if (csrfToken && !['get', 'head', 'options'].includes(config.method?.toLowerCase())) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = ['/auth/login/', '/auth/refresh/'].some((path) =>
            originalRequest?.url?.endsWith(path)
        );

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                if (!refreshPromise) {
                    refreshPromise = refreshClient
                        .post('/auth/refresh/', {})
                        .then((response) => {
                            setAccessToken(response.data.access);
                            return response.data.access;
                        })
                        .finally(() => {
                            refreshPromise = null;
                        });
                }

                const access = await refreshPromise;

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear token and redirect to login
                clearAccessToken();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                    window.location.assign('/admin/login');
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const errorMessage = extractErrorMessage(error);
        error.displayMessage = errorMessage;

        return Promise.reject(error);
    }
);

/**
 * Extract user-friendly error message from error response
 */
const extractErrorMessage = (error) => {
    if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === 'string') {
            return data;
        }

        if (data.message) {
            return data.message;
        }

        if (data.detail) {
            return data.detail;
        }

        if (typeof data.error === 'string') {
            return data.error;
        }

        if (data.error?.message) {
            return data.error.message;
        }

        // Handle validation errors
        if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            if (firstKey && Array.isArray(data[firstKey])) {
                return data[firstKey][0];
            }
        }
    }

    if (error.message === 'Network Error') {
        return 'Unable to connect to server. Please check your internet connection.';
    }

    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
    }

    return 'An unexpected error occurred. Please try again.';
};

/**
 * Retry utility for failed requests
 */
export const withRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;

            // Don't retry on 4xx errors (client errors)
            if (error.response?.status >= 400 && error.response?.status < 500) {
                throw error;
            }

            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

export default api;
