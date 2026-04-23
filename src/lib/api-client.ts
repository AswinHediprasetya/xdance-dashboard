import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? 'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
