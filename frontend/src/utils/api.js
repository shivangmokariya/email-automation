import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL || 'https://email-automation-purq.onrender.com/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Optional: Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can customize global error handling here
    // For example, show a toast or redirect on 401
    return Promise.reject(error);
  }
);

export default api; 