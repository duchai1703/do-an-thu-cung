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
   * Get cages by size
   * GET /cages/by-size/:size
   * @param {string} size - Cage size (SMALL, MEDIUM, LARGE, EXTRA_LARGE)
   * @returns {Promise<{success: boolean, data?: CageResponse[], error?: string}>}
   */
  getBySize: async (size) => {
    try {
      const response = await apiClient.get(`/cages/by-size/${size}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get cages by status
   * GET /cages/by-status/:status
   * @param {string} status - Cage status (AVAILABLE, OCCUPIED, MAINTENANCE)
   * @returns {Promise<{success: boolean, data?: CageResponse[], error?: string}>}
   */
  getByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/cages/by-status/${status}`);

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
   * Release pet from cage (check out)
   * POST /cages/:id/release
   * @param {number} cageId - Cage ID
   * @param {Object} releaseData - Release data including check-out date and notes
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  releasePet: async (cageId, releaseData) => {
    try {
      const response = await apiClient.post(`/cages/${cageId}/release`, releaseData);

      return {
        success: true,
        data: response.data,
        message: 'Pet released from cage successfully',
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
   * Update cage assignment
   * PUT /cages/assignments/:assignmentId
   * @param {number} assignmentId - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  updateAssignment: async (assignmentId, assignmentData) => {
    try {
      const response = await apiClient.put(`/cages/assignments/${assignmentId}`, assignmentData);

      return {
        success: true,
        data: response.data,
        message: 'Cage assignment updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get cage occupancy statistics
   * GET /cages/statistics/occupancy
   * @returns {Promise<{success: boolean, data?: {total: number, occupied: number, available: number, maintenance: number}, error?: string}>}
   */
  getOccupancyStats: async () => {
    try {
      const response = await apiClient.get('/cages/statistics/occupancy');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Set cage to maintenance mode
   * PUT /cages/:id/maintenance
   * @param {number} cageId - Cage ID
   * @param {Object} maintenanceData - Maintenance data including reason and expected completion date
   * @returns {Promise<{success: boolean, data?: CageResponse, message?: string, error?: string}>}
   */
  setMaintenance: async (cageId, maintenanceData) => {
    try {
      const response = await apiClient.put(`/cages/${cageId}/maintenance`, maintenanceData);

      return {
        success: true,
        data: response.data,
        message: 'Cage set to maintenance mode',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
