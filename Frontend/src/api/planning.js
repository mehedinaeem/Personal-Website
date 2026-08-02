import api from './axios';
const data = (response) => response.data;
const resource = (base) => ({
    list: (params = {}) => api.get(base, { params }).then(data),
    get: (id) => api.get(`${base}${id}/`).then(data),
    create: (payload) => api.post(base, payload).then(data),
    update: (id, payload) => api.patch(`${base}${id}/`, payload).then(data),
    delete: (id) => api.delete(`${base}${id}/`),
});

export const goalsApi = {
    ...resource('/goals/'),
    updateProgress: (id, current_value) => api.post(`/goals/${id}/update-progress/`, { current_value }).then(data),
    complete: (id) => api.post(`/goals/${id}/complete/`).then(data),
};
export const reviewsApi = resource('/progress/reviews/');
export const activitiesApi = resource('/progress/activities/');
export const progressApi = { summary: (params) => api.get('/progress/summary/', { params }).then(data) };
export const learningApi = {
    ...resource('/learning/items/'),
    sessions: (id) => api.get(`/learning/items/${id}/sessions/`).then(data),
    addSession: (id, payload) => api.post(`/learning/items/${id}/sessions/`, payload).then(data),
};
export const travelApi = {
    ...resource('/travel/plans/'),
    itinerary: (id) => api.get(`/travel/plans/${id}/itinerary/`).then(data),
    addItinerary: (id, payload) => api.post(`/travel/plans/${id}/itinerary/`, payload).then(data),
    checklist: (id) => api.get(`/travel/plans/${id}/checklist/`).then(data),
    addChecklist: (id, payload) => api.post(`/travel/plans/${id}/checklist/`, payload).then(data),
};
