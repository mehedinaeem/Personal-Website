/**
 * Authentication API service
 */

import api, { setAccessToken, clearAccessToken } from './axios';

const authApi = {
    /**
     * Login with email and password
     */
    login: async (email, password) => {
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
        const response = await api.get('/auth/profile/');
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (data) => {
        const response = await api.patch('/auth/profile/', data);
        return response.data;
    },

    /**
     * Change password
     */
    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/auth/change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
        });
        return response.data;
    },

    /**
     * Verify token is valid
     */
    verifyToken: async () => {
        const response = await api.post('/auth/verify/');
        return response.data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        const response = await api.post('/auth/refresh/');
        const { access } = response.data;
        setAccessToken(access);
        return response.data;
    },
};

export default authApi;
