/**
 * Contact API service
 */

import api from './axios';

const contactApi = {
    /**
     * Send contact message (public)
     */
    sendMessage: async (data) => {
        const response = await api.post('/contact/', data);
        return response.data;
    },

    /**
     * Get all messages (admin only)
     */
    getMessages: async (params = {}) => {
        const response = await api.get('/contact/', { params });
        return response.data;
    },

    /**
     * Mark message as read (admin only)
     */
    markAsRead: async (id) => {
        const response = await api.patch(`/contact/${id}/`, { is_read: true });
        return response.data;
    },

    /**
     * Delete message (admin only)
     */
    delete: async (id) => {
        await api.delete(`/contact/${id}/`);
    },
};

export default contactApi;
