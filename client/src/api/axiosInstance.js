import axios from 'axios';

export const BASE_URL = 'http://localhost:3001';

export const STATUS = {
    SUCCESS: 200,
    NOT_AUTHORIZED: 401,
    BAD_REQUEST: 400,
    SERVER_ERROR: 500,
    DUPLICATE_ENTRY: 409,
  };

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Set token on each request if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
