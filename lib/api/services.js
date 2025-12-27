import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreateServiceDto} CreateServiceDto
 * @typedef {import('./types').UpdateServiceDto} UpdateServiceDto
 * @typedef {import('./types').ServiceResponse} ServiceResponse
 */

/**
 * Service API Functions
 * Base path: /services
 */
export const serviceApi = {
  /**
   * Get all services
   * GET /services
   * @param {Object} [params={}] - Query parameters for filtering
   * @returns {Promise<{success: boolean, data?: ServiceResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/services', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get service by ID
   * GET /services/:id
   * @param {number} serviceId - Service ID
   * @returns {Promise<{success: boolean, data?: ServiceResponse, error?: string}>}
   */
  getById: async (serviceId) => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get services by category
   * GET /services/by-category/:categoryId
   * @param {number} categoryId - Service category ID
   * @returns {Promise<{success: boolean, data?: ServiceResponse[], error?: string}>}
   */
  getByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/services/by-category/${categoryId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get available services
   * GET /services/available
   * @returns {Promise<{success: boolean, data?: ServiceResponse[], error?: string}>}
   */
  getAvailable: async () => {
    try {
      const response = await apiClient.get('/services/available');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get boarding services
   * GET /services/boarding
   * @returns {Promise<{success: boolean, data?: ServiceResponse[], error?: string}>}
   */
  getBoarding: async () => {
    try {
      const response = await apiClient.get('/services/boarding');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new service (Admin/Manager only)
   * POST /services
   * @param {CreateServiceDto} serviceData - Service data including name, category, price, etc.
   * @returns {Promise<{success: boolean, data?: ServiceResponse, message?: string, error?: string}>}
   */
  create: async (serviceData) => {
    try {
      const response = await apiClient.post('/services', serviceData);

      return {
        success: true,
        data: response.data,
        message: 'Service created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update service
   * PUT /services/:id
   * @param {number} serviceId - Service ID
   * @param {UpdateServiceDto} serviceData - Updated service data
   * @returns {Promise<{success: boolean, data?: ServiceResponse, message?: string, error?: string}>}
   */
  update: async (serviceId, serviceData) => {
    try {
      const response = await apiClient.put(`/services/${serviceId}`, serviceData);

      return {
        success: true,
        data: response.data,
        message: 'Service updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete service
   * DELETE /services/:id
   * @param {number} serviceId - Service ID to delete
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  delete: async (serviceId) => {
    try {
      const response = await apiClient.delete(`/services/${serviceId}`);

      return {
        success: true,
        data: response.data,
        message: 'Service deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Toggle service availability
   * PUT /services/:id/availability
   * @param {number} serviceId - Service ID
   * @param {boolean} [newAvailability] - New availability status. If not provided, will toggle current status.
   * @returns {Promise<{success: boolean, data?: ServiceResponse, message?: string, error?: string}>}
   */
  toggleAvailability: async (serviceId, newAvailability) => {
    try {
      // If newAvailability is not provided, we need to get current status and toggle it
      let isAvailable = newAvailability;
      
      if (isAvailable === undefined) {
        // Get current service to determine current availability
        const currentService = await apiClient.get(`/services/${serviceId}`);
        isAvailable = !(currentService.data?.isAvailable ?? true);
      }

      const response = await apiClient.put(`/services/${serviceId}/availability`, {
        isAvailable: isAvailable
      });

      return {
        success: true,
        data: response.data,
        message: 'Service availability updated',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Search services
   * GET /services/search
   * @param {Object} searchParams - Search parameters (keyword, category, priceRange, etc.)
   * @returns {Promise<{success: boolean, data?: ServiceResponse[], error?: string}>}
   */
  search: async (searchParams) => {
    try {
      const response = await apiClient.get('/services/search', { params: searchParams });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
