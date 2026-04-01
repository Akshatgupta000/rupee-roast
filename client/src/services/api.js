import axios from 'axios';

/**
 * Centralized Axios instance.
 * baseURL is set from VITE_API_URL (which must already include /api if needed).
 * Local fallback: http://localhost:5000/api
 *
 * All callers use paths like: api.get('/expenses'), api.post('/auth/login')
 * Never include /api in the call path — it is already in the baseURL.
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true
});

// Request Interceptor: Attach JWT token
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'API Error';
    return Promise.reject({ ...error, message });
  }
);

export default API;
