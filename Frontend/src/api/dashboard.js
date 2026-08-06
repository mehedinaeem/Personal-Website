import api from './axios';
export default { summary: () => api.get('/dashboard/summary/').then((response) => response.data) };
