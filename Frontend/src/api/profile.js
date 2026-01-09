/**
 * Profile/About API service
 */

import api from './axios';

const profileApi = {
    /**
     * Get profile data (public)
     */
    get: async () => {
        const response = await api.get('/profile/');
        return response.data;
    },

    /**
     * Update profile (admin only)
     */
    update: async (data) => {
        const response = await api.patch('/profile/', data);
        return response.data;
    },

    /**
     * Upload profile image (admin only)
     */
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/profile/upload-image/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Upload resume (admin only)
     */
    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await api.post('/profile/upload-resume/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default profileApi;
