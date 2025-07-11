import axios from 'axios';
import toast from 'react-hot-toast';

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

// ---------- Request interceptor: attach JWT if present ----------
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Response interceptor: map errors → user-friendly toast ----------
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const serverMsg = error?.response?.data?.error;

    let userMsg = 'Something went wrong. Please try again.';

    switch (status) {
      case STATUS.BAD_REQUEST:
        userMsg = serverMsg || 'Bad request.';
        break;
      case STATUS.NOT_AUTHORIZED:
        userMsg = 'Please log in to continue.';
        break;
      case 404:
        userMsg = serverMsg || 'Resource not found.';
        break;
      case STATUS.SERVER_ERROR:
        userMsg =
          'Unfortunately, we couldn’t complete your request at this time.';
        break;
      default:
        if (serverMsg) userMsg = serverMsg;
    }

    toast.error(userMsg);
    return Promise.reject(error);
  }
);

export default axiosInstance;
