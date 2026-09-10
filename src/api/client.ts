import axios from 'axios';

const getApiUrl = (): string => {
  const env = (import.meta as any).env || {};
  const url = env.VITE_API_URL || env.API_URL;
  if (url && typeof url === 'string' && url.trim() !== '') {
    return url.trim();
  }
  return 'https://digi-gate-backend.onrender.com/api';
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('digi_gate_token') || sessionStorage.getItem('digi_gate_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;