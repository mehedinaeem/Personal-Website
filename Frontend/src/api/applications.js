import api from './axios';
const data = (response) => response.data;

export const opportunitiesApi = {
    getAll: (params = {}) => api.get('/opportunities/', { params }).then(data),
    getUpcoming: (params = {}) => api.get('/opportunities/upcoming/', { params }).then(data),
    getExpired: (params = {}) => api.get('/opportunities/expired/', { params }).then(data),
    get: (id) => api.get(`/opportunities/${id}/`).then(data),
    create: (payload) => api.post('/opportunities/', payload).then(data),
    update: (id, payload) => api.patch(`/opportunities/${id}/`, payload).then(data),
    delete: (id) => api.delete(`/opportunities/${id}/`),
    markApplied: (id) => api.post(`/opportunities/${id}/mark-applied/`).then(data),
};

export const captureApi = {
    extract: (url) => api.post('/capture/extract/', { url }).then(data),
    get: (id) => api.get(`/capture/${id}/`).then(data),
    linkOpportunity: (id, opportunity) => api.patch(`/capture/${id}/`, { created_opportunity: opportunity }).then(data),
};

const applicationsApi = {
    getAll: (params = {}) => api.get('/applications/', { params }).then(data),
    get: (id) => api.get(`/applications/${id}/`).then(data),
    create: (payload) => api.post('/applications/', payload).then(data),
    update: (id, payload) => api.patch(`/applications/${id}/`, payload).then(data),
    delete: (id) => api.delete(`/applications/${id}/`),
};

export default applicationsApi;
