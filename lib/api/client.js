import axios from 'axios';

// Base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Token storage keys
export const TOKEN_KEY = 'pet_care_token';

/**
 * Get stored JWT token from localStorage
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Store JWT token in localStorage
 */
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add JWT token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle responses and errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Backend uses ResponseInterceptor that wraps responses in ApiResponseDto
    // Extract data from the standardized response format
    if (response.data && typeof response.data === 'object') {
      // If backend returns { statusCode, data, message, timestamp }
      if ('data' in response.data) {
        return response.data; // Return the full ApiResponseDto
      }
    }
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - token expired or invalid
      if (status === 401) {
        removeToken();
        // Optionally redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden - insufficient permissions
      if (status === 403) {
        console.error('Access denied: Insufficient permissions');
      }

      // Extract error message from response
      const errorMessage =
        data?.message ||
        data?.error ||
        error.message ||
        'An error occurred';

      return Promise.reject({
        status,
        message: errorMessage,
        data,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
        data: null,
      });
    } else {
      // Error in request configuration
      return Promise.reject({
        status: 0,
        message: error.message || 'Request configuration error',
        data: null,
      });
    }
  }
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.status === 0) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    statusCode: error.status,
  };
};

export default apiClient;
