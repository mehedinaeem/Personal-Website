/**
 * Applications API service
 * CRUD operations for application tracker
 */

import api from './axios';

const applicationsApi = {
    /**
     * Get all applications with optional filters
     * @param {Object} params - Query parameters (category, status, ordering, search)
     */
    getAll: async (params = {}) => {
        const response = await api.get('/applications/', { params });
        return response.data;
    },

    /**
     * Get a single application by ID
     * @param {number} id - Application ID
     */
    getById: async (id) => {
        const response = await api.get(`/applications/${id}/`);
        return response.data;
    },

    /**
     * Create a new application
     * @param {Object} data - Application data
     */
    create: async (data) => {
        const response = await api.post('/applications/', data);
        return response.data;
    },

    /**
     * Update an existing application
     * @param {number} id - Application ID
     * @param {Object} data - Updated application data
     */
    update: async (id, data) => {
        const response = await api.patch(`/applications/${id}/`, data);
        return response.data;
    },

    /**
     * Delete an application
     * @param {number} id - Application ID
     */
    delete: async (id) => {
        await api.delete(`/applications/${id}/`);
    },
};

export default applicationsApi;
