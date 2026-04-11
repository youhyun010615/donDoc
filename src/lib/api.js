import axios from 'axios';

const api = axios.create();

api.interceptors.request.use((config) => {
  config.headers['X-Internal-Token'] = import.meta.env.VITE_INTERNAL_API_SECRET;
  return config;
});

export default api;