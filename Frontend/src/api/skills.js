/**
 * Skills API service
 */

import api from './axios';

const skillsApi = {
    /**
     * Get all skills (public)
     */
    getAll: async () => {
        const response = await api.get('/skills/');
        return response.data;
    },

    /**
     * Get skills by category (public)
     */
    getByCategory: async (category) => {
        const response = await api.get('/skills/', { params: { category } });
        return response.data;
    },

    /**
     * Get skill categories (public)
     */
    getCategories: async () => {
        const response = await api.get('/skills/categories/');
        return response.data;
    },

    /**
     * Create new skill (admin only)
     */
    create: async (data) => {
        const response = await api.post('/skills/', data);
        return response.data;
    },

    /**
     * Update skill (admin only)
     */
    update: async (id, data) => {
        const response = await api.patch(`/skills/${id}/`, data);
        return response.data;
    },

    /**
     * Delete skill (admin only)
     */
    delete: async (id) => {
        await api.delete(`/skills/${id}/`);
    },

    /**
     * Reorder skills (admin only)
     */
    reorder: async (orderedIds) => {
        const response = await api.post('/skills/reorder/', { order: orderedIds });
        return response.data;
    },
};

export default skillsApi;
