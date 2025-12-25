import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreateCageDto} CreateCageDto
 * @typedef {import('./types').UpdateCageDto} UpdateCageDto
 * @typedef {import('./types').CageResponse} CageResponse
 * @typedef {import('./types').CageSize} CageSize
 * @typedef {import('./types').CageStatus} CageStatus
 * @typedef {import('./types').GetCagesQuery} GetCagesQuery
 * @typedef {import('./types').GetAvailableCagesQuery} GetAvailableCagesQuery
 */

/**
 * Cage API Functions
 * Base path: /cages
 */
export const cageApi = {
  /**
   * Create a new cage
   * POST /cages
   * @param {CreateCageDto} cageData - Cage data including size, location, features, etc.
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  create: async (cageData) => {
    try {
      const response = await apiClient.post('/cages', cageData);

      return {
        success: true,
        data: response.data,
        message: 'Cage created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all cages
   * GET /cages
   * @param {GetCagesQuery} [params={}] - Query parameters for filtering (size, isAvailable)
   * @returns {Promise<{success: boolean, data?: CageResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/cages', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get cage by ID
   * GET /cages/:id
   * @param {number} cageId - Cage ID
   * @returns {Promise<{success: boolean, data?: CageResponse, error?: string}>}
   */
  getById: async (cageId) => {
    try {
      const response = await apiClient.get(`/cages/${cageId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get available cages
   * GET /cages/available
   * @param {Object} [params={}] - Query parameters for filtering (size, dateRange, etc.)
   * @returns {Promise<{success: boolean, data?: CageResponse[], error?: string}>}
   */
  getAvailable: async (params = {}) => {
    try {
      const response = await apiClient.get('/cages/available', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get current active assignment for a cage
   * GET /cages/:id/current-assignment
   * @param {number} cageId - Cage ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getCurrentAssignment: async (cageId) => {
    try {
      const response = await apiClient.get(`/cages/${cageId}/current-assignment`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update cage
   * PUT /cages/:id
   * @param {number} cageId - Cage ID
   * @param {UpdateCageDto} cageData - Updated cage data
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  update: async (cageId, cageData) => {
    try {
      const response = await apiClient.put(`/cages/${cageId}`, cageData);

      return {
        success: true,
        data: response.data,
        message: 'Cage updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete cage
   * DELETE /cages/:id
   * @param {number} cageId - Cage ID to delete
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  remove: async (cageId) => {
    try {
      const response = await apiClient.delete(`/cages/${cageId}`);

      return {
        success: true,
        data: response.data,
        message: 'Cage deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Assign pet to cage
   * POST /cages/:id/assign
   * @param {number} cageId - Cage ID
   * @param {Object} assignmentData - Assignment data including pet ID, check-in date, expected check-out date
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  assignPet: async (cageId, assignmentData) => {
    try {
      const response = await apiClient.post(`/cages/${cageId}/assign`, assignmentData);

      return {
        success: true,
        data: response.data,
        message: 'Pet assigned to cage successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Set cage to maintenance mode
   * PUT /cages/:id/maintenance
   * @param {number} cageId - Cage ID
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  startMaintenance: async (cageId) => {
    try {
      const response = await apiClient.put(`/cages/${cageId}/maintenance`);

      return {
        success: true,
        data: response.data,
        message: 'Cage set to maintenance mode',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check out pet from cage
   * PUT /cages/assignments/:assignmentId/checkout
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  checkOutPet: async (assignmentId) => {
    try {
      const response = await apiClient.put(`/cages/assignments/${assignmentId}/checkout`);

      return {
        success: true,
        data: response.data,
        message: 'Pet checked out successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get cage assignment history
   * GET /cages/:id/assignments
   * @param {number} cageId - Cage ID
   * @param {Object} [params={}] - Query parameters for filtering
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getAssignments: async (cageId, params = {}) => {
    try {
      const response = await apiClient.get(`/cages/${cageId}/assignments`, { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get active cage assignments
   * GET /cages/assignments/active
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getActiveAssignments: async () => {
    try {
      const response = await apiClient.get('/cages/assignments/active');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get cage assignment by ID
   * GET /cages/assignments/:assignmentId
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAssignmentById: async (assignmentId) => {
    try {
      const response = await apiClient.get(`/cages/assignments/${assignmentId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Complete maintenance and make cage available
   * PUT /cages/:id/complete-maintenance
   * @param {number} cageId - Cage ID
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  completeMaintenance: async (cageId) => {
    try {
      const response = await apiClient.put(`/cages/${cageId}/complete-maintenance`);

      return {
        success: true,
        data: response.data,
        message: 'Maintenance completed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Reserve cage for upcoming booking
   * PUT /cages/:id/reserve
   * @param {number} cageId - Cage ID
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  reserveCage: async (cageId) => {
    try {
      const response = await apiClient.put(`/cages/${cageId}/reserve`);

      return {
        success: true,
        data: response.data,
        message: 'Cage reserved successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cancel cage reservation
   * PUT /cages/:id/cancel-reservation
   * @param {number} cageId - Cage ID
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  cancelReservation: async (cageId) => {
    try {
      const response = await apiClient.put(`/cages/${cageId}/cancel-reservation`);

      return {
        success: true,
        data: response.data,
        message: 'Reservation cancelled successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
