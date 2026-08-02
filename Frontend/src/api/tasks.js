import api from './axios';

const unwrap = (response) => response.data;

const tasksApi = {
    getAll: (params = {}) => api.get('/tasks/', { params }).then(unwrap),
    getToday: (params = {}) => api.get('/tasks/today/', { params }).then(unwrap),
    getUpcoming: (params = {}) => api.get('/tasks/upcoming/', { params }).then(unwrap),
    getOverdue: (params = {}) => api.get('/tasks/overdue/', { params }).then(unwrap),
    get: (id) => api.get(`/tasks/${id}/`).then(unwrap),
    create: (data) => api.post('/tasks/', data).then(unwrap),
    update: (id, data) => api.patch(`/tasks/${id}/`, data).then(unwrap),
    delete: (id) => api.delete(`/tasks/${id}/`),
    complete: (id) => api.post(`/tasks/${id}/complete/`).then(unwrap),
    getLogs: (id) => api.get(`/tasks/${id}/logs/`).then(unwrap),
    addLog: (id, data) => api.post(`/tasks/${id}/logs/`, data).then(unwrap),
};

export const dailyReviewsApi = {
    getAll: () => api.get('/daily-reviews/').then(unwrap),
    get: (date) => api.get(`/daily-reviews/${date}/`).then(unwrap),
    create: (data) => api.post('/daily-reviews/', data).then(unwrap),
    update: (date, data) => api.patch(`/daily-reviews/${date}/`, data).then(unwrap),
};

export default tasksApi;
