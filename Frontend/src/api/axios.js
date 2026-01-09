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
});

// Token storage (in-memory for security)
let accessToken = null;

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

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add authorization header if token exists
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const response = await axios.post(
                    `${config.api.baseUrl}/auth/refresh/`,
                    {},
                    { withCredentials: true }
                );

                const { access } = response.data;
                setAccessToken(access);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear token and redirect to login
                clearAccessToken();
                window.dispatchEvent(new CustomEvent('auth:logout'));
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

        if (data.error) {
            return data.error;
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
