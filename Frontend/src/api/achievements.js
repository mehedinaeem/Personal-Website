/**
 * Achievements API service
 */

import api from './axios';

const achievementsApi = {
    /**
     * Get all achievements (public)
     */
    getAll: async () => {
        const response = await api.get('/achievements/');
        return response.data;
    },

    /**
     * Get achievements by type (public)
     */
    getByType: async (type) => {
        const response = await api.get('/achievements/', { params: { type } });
        return response.data;
    },

    /**
     * Create new achievement (admin only)
     */
    create: async (data) => {
        const response = await api.post('/achievements/', data);
        return response.data;
    },

    /**
     * Update achievement (admin only)
     */
    update: async (id, data) => {
        const response = await api.patch(`/achievements/${id}/`, data);
        return response.data;
    },

    /**
     * Delete achievement (admin only)
     */
    delete: async (id) => {
        await api.delete(`/achievements/${id}/`);
    },

    /**
     * Upload certificate image (admin only)
     */
    uploadCertificate: async (id, file) => {
        const formData = new FormData();
        formData.append('certificate', file);
        const response = await api.post(`/achievements/${id}/upload-certificate/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default achievementsApi;
