import apiClient, { handleApiError } from './client';

/**
 * Day Off API Functions
 * Base path: /day-offs
 */
export const dayOffApi = {
  /**
   * Create a new day-off
   * POST /day-offs
   * @param {Object} dayOffData - Day off data
   * @param {string} dayOffData.date - Date in ISO 8601 format (YYYY-MM-DD)
   * @param {string} dayOffData.name - Name of the day off
   * @param {string} [dayOffData.description] - Optional description
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  create: async (dayOffData) => {
    try {
      const response = await apiClient.post('/day-offs', dayOffData);

      return {
        success: true,
        data: response.data,
        message: 'Day off created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all day-offs or filter by date range
   * GET /day-offs
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.startDate] - Start date for filtering (YYYY-MM-DD)
   * @param {string} [params.endDate] - End date for filtering (YYYY-MM-DD)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/day-offs', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get day-off by ID
   * GET /day-offs/:id
   * @param {number} id - Day off ID
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/day-offs/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update an existing day-off
   * PUT /day-offs/:id
   * @param {number} id - Day off ID
   * @param {Object} updateData - Updated day off data
   * @param {string} [updateData.date] - Date in ISO 8601 format
   * @param {string} [updateData.name] - Name of the day off
   * @param {string} [updateData.description] - Description
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/day-offs/${id}`, updateData);

      return {
        success: true,
        data: response.data,
        message: 'Day off updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a day-off
   * DELETE /day-offs/:id
   * @param {number} id - Day off ID
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  delete: async (id) => {
    try {
      await apiClient.delete(`/day-offs/${id}`);

      return {
        success: true,
        message: 'Day off deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check if a specific date is a day-off
   * GET /day-offs/check/:date
   * @param {string} date - Date to check (YYYY-MM-DD)
   * @returns {Promise<{success: boolean, data?: {isDayOff: boolean}, error?: string}>}
   */
  checkDayOff: async (date) => {
    try {
      const response = await apiClient.get(`/day-offs/check/${date}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check if there are appointments on a specific date
   * GET /day-offs/appointments/:date
   * @param {string} date - Date to check (YYYY-MM-DD)
   * @returns {Promise<{success: boolean, data?: {hasAppointments: boolean, count: number}, error?: string}>}
   */
  checkAppointments: async (date) => {
    try {
      const response = await apiClient.get(`/day-offs/appointments/${date}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default dayOffApi;
