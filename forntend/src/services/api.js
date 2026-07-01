import axios from 'axios';

// Get base URL from environment or default to localhost:8080/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT token from localStorage to the request headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global handler for responses/errors
apiClient.interceptors.response.use(
  (response) => response.data, // Unwraps the backend's ResponseEntity and returns the ApiResponseDto body
  (error) => {
    // Check if the user is unauthorized/forbidden (e.g. token expired)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Safely clear credentials and redirect to login if applicable
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    
    // Format error response so calling code gets standard structures
    const customError = {
      success: false,
      message: error.response?.data?.message || error.message || 'Something went wrong',
      data: error.response?.data?.data || null,
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
