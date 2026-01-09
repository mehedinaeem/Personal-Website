/**
 * Projects API service
 */

import api from './axios';

const projectsApi = {
    /**
     * Get all projects (public)
     */
    getAll: async (params = {}) => {
        const response = await api.get('/projects/', { params });
        return response.data;
    },

    /**
     * Get featured projects (public)
     */
    getFeatured: async () => {
        const response = await api.get('/projects/', { params: { featured: true } });
        return response.data;
    },

    /**
     * Get single project by slug (public)
     */
    getBySlug: async (slug) => {
        const response = await api.get(`/projects/${slug}/`);
        return response.data;
    },

    /**
     * Create new project (admin only)
     */
    create: async (data) => {
        const response = await api.post('/projects/', data);
        return response.data;
    },

    /**
     * Update project (admin only)
     */
    update: async (id, data) => {
        const response = await api.patch(`/projects/${id}/`, data);
        return response.data;
    },

    /**
     * Delete project (admin only)
     */
    delete: async (id) => {
        await api.delete(`/projects/${id}/`);
    },

    /**
     * Upload project image (admin only)
     */
    uploadImage: async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/projects/${id}/upload-image/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default projectsApi;
