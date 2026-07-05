import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.kanchira.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token dynamically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// DEBUG: log every outgoing request and response
api.interceptors.request.use((config) => {
  console.log('[API REQUEST]', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});
api.interceptors.response.use(
  (response) => {
    console.log('[API RESPONSE]', response.status, response.config.url, JSON.stringify(response.data).slice(0, 200));
    return response;
  },
  (error) => {
    console.log('[API ERROR]', error.config?.url, error.message, error.response?.status);
    return Promise.reject(error);
  }
);

export default api;
