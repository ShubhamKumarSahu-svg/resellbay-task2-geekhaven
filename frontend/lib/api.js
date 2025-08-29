import useAppStore from '@/stores/useAppStore';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = useAppStore.getState()?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.warn('Could not attach auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        useAppStore.getState()?.logout();
      } catch (storeError) {
        console.warn('Could not logout after 401:', storeError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
