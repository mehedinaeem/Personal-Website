/**
 * Blogs API service
 */

import api from './axios';

const blogsApi = {
    /**
     * Get all published blogs (public)
     */
    getPublished: async (params = {}) => {
        const response = await api.get('/blogs/', { params: { ...params, status: 'published' } });
        return response.data;
    },

    /**
     * Get all blogs including drafts (admin only)
     */
    getAll: async (params = {}) => {
        const response = await api.get('/blogs/all/', { params });
        return response.data;
    },

    /**
     * Get single blog by slug (public)
     */
    getBySlug: async (slug) => {
        const response = await api.get(`/blogs/${slug}/`);
        return response.data;
    },

    /**
     * Get blog categories (public)
     */
    getCategories: async () => {
        const response = await api.get('/blogs/categories/');
        return response.data;
    },

    /**
     * Create new blog (admin only)
     */
    create: async (data) => {
        const response = await api.post('/blogs/', data);
        return response.data;
    },

    /**
     * Update blog (admin only)
     */
    update: async (id, data) => {
        const response = await api.patch(`/blogs/${id}/`, data);
        return response.data;
    },

    /**
     * Delete blog (admin only)
     */
    delete: async (id) => {
        await api.delete(`/blogs/${id}/`);
    },

    /**
     * Publish blog (admin only)
     */
    publish: async (id) => {
        const response = await api.post(`/blogs/${id}/publish/`);
        return response.data;
    },

    /**
     * Unpublish blog (admin only)
     */
    unpublish: async (id) => {
        const response = await api.post(`/blogs/${id}/unpublish/`);
        return response.data;
    },

    /**
     * Upload blog thumbnail (admin only)
     */
    uploadThumbnail: async (id, file) => {
        const formData = new FormData();
        formData.append('thumbnail', file);
        const response = await api.post(`/blogs/${id}/upload-thumbnail/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default blogsApi;
