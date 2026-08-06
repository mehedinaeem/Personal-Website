import api from './axios';
const data = (response) => response.data;

const remindersApi = {
    list: (params = {}) => api.get('/reminders/', { params }).then(data),
    create: (payload) => api.post('/reminders/', payload).then(data),
    update: (id, payload) => api.patch(`/reminders/${id}/`, payload).then(data),
    cancel: (id) => api.post(`/reminders/${id}/cancel/`).then(data),
    delete: (id) => api.delete(`/reminders/${id}/`),
};
export default remindersApi;
