import axios from 'axios';

const token = localStorage.getItem('token');

axios.interceptors.request.use(
  (config) => {
    if (token) {
      // Ensure headers is defined
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
