/**
 * API Client - Centralized HTTP client for all API calls
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom API Error class for better error handling
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Main API Client class
 */
export class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from localStorage
   * @returns {string|null} JWT token or null
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * Set authentication token to localStorage
   * @param {string} token - JWT token
   */
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  /**
   * Remove authentication token from localStorage
   */
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Main request method
   * @param {string} endpoint - API endpoint (e.g., '/api/auth/login')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        // If 401, token might be expired
        if (response.status === 401) {
          this.removeToken();
          
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
        }

        throw new APIError(
          data?.message || data || 'Có lỗi xảy ra',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      // Network error or other issues
      if (error instanceof APIError) {
        throw error;
      }

      // Handle network errors
      if (!navigator.onLine) {
        throw new APIError(
          'Không có kết nối internet. Vui lòng kiểm tra và thử lại.',
          0,
          null
        );
      }

      throw new APIError(
        error.message || 'Có lỗi xảy ra khi kết nối đến server',
        0,
        null
      );
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file with FormData
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData with files
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async upload(endpoint, formData, options = {}) {
    const token = this.getToken();
    const headers = {
      ...options.headers,
      // Don't set Content-Type for FormData, browser will set it with boundary
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();

// Export default for convenience
export default apiClient;
