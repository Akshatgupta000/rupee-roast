import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000, // 15 seconds as Gemini can be slow
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      if (response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Standardize error message from backend
      error.message = response.data?.message || error.message;
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'Network error or server is unreachable. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
