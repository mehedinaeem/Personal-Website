/**
 * Authentication API service
 */

import api, { setAccessToken, clearAccessToken, setCsrfToken } from './axios';

const authApi = {
    /** Set the CSRF cookie before credentialed authentication requests. */
    prepareCsrf: async () => {
        const response = await api.get('/auth/csrf/');
        setCsrfToken(response.data.csrfToken);
    },

    /**
     * Login with email and password
     */
    login: async (email, password) => {
        await authApi.prepareCsrf();
        const response = await api.post('/auth/login/', { email, password });
        const { access, user } = response.data;
        setAccessToken(access);
        return { user };
    },

    /**
     * Logout - clear tokens
     */
    logout: async () => {
        try {
            await api.post('/auth/logout/');
        } finally {
            clearAccessToken();
        }
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        const response = await api.get('/auth/me/');
        return response.data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        await authApi.prepareCsrf();
        const response = await api.post('/auth/refresh/');
        const { access } = response.data;
        setAccessToken(access);
        return response.data;
    },
};

export default authApi;
