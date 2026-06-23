import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://kanchira-backend-1.onrender.com/api';

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

export default api;
