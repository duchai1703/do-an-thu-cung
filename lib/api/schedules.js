import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreateScheduleDto} CreateScheduleDto
 * @typedef {import('./types').UpdateScheduleDto} UpdateScheduleDto
 * @typedef {import('./types').ScheduleResponse} ScheduleResponse
 */

/**
 * Work Schedule API Functions
 * Base path: /schedules
 */
export const scheduleApi = {
  /**
   * Create a new work schedule
   * POST /schedules
   * @param {CreateScheduleDto} scheduleData - Schedule data including employee ID, date, time slots, etc.
   * @returns {Promise<{success: boolean, data?: ScheduleResponse, message?: string, error?: string}>}
   */
  create: async (scheduleData) => {
    try {
      const response = await apiClient.post('/schedules', scheduleData);

      return {
        success: true,
        data: response.data,
        message: 'Schedule created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all schedules
   * GET /schedules
   * @param {Object} [params={}] - Query parameters for filtering
   * @returns {Promise<{success: boolean, data?: ScheduleResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/schedules', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get schedule by ID
   * GET /schedules/:id
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<{success: boolean, data?: ScheduleResponse, error?: string}>}
   */
  getById: async (scheduleId) => {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get schedules by employee ID
   * GET /schedules/employee/:employeeId
   * @param {number} employeeId - Employee ID
   * @param {string} [startDate] - Start date (YYYY-MM-DD format)
   * @param {string} [endDate] - End date (YYYY-MM-DD format)
   * @returns {Promise<{success: boolean, data?: ScheduleResponse[], error?: string}>}
   */
  getByEmployee: async (employeeId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await apiClient.get(`/schedules/employee/${employeeId}`, { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get schedules by date range
   * GET /schedules (with startDate and endDate query params)
   * @param {string} startDate - Start date (YYYY-MM-DD format)
   * @param {string} endDate - End date (YYYY-MM-DD format)
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<{success: boolean, data?: ScheduleResponse[], error?: string}>}
   */
  getByDateRange: async (startDate, endDate, params = {}) => {
    try {
      // Backend uses GET /schedules with startDate, endDate query params
      const response = await apiClient.get('/schedules', {
        params: { startDate, endDate, ...params },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get schedules for a specific date
   * GET /schedules/date/:date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<{success: boolean, data?: ScheduleResponse[], error?: string}>}
   */
  getByDate: async (date) => {
    try {
      const response = await apiClient.get(`/schedules/date/${date}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get available employees for a specific time slot
   * GET /schedules/available-employees
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} startTime - Start time (HH:MM format)
   * @param {string} endTime - End time (HH:MM format)
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getAvailableEmployees: async (date, startTime, endTime) => {
    try {
      const response = await apiClient.get('/schedules/available-employees', {
        params: { date, startTime, endTime },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update schedule
   * PUT /schedules/:id
   * @param {number} scheduleId - Schedule ID
   * @param {UpdateScheduleDto} scheduleData - Updated schedule data
   * @returns {Promise<{success: boolean, data?: ScheduleResponse, message?: string, error?: string}>}
   */
  update: async (scheduleId, scheduleData) => {
    try {
      const response = await apiClient.put(`/schedules/${scheduleId}`, scheduleData);

      return {
        success: true,
        data: response.data,
        message: 'Schedule updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete schedule
   * DELETE /schedules/:id
   * @param {number} scheduleId - Schedule ID to delete
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  remove: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`/schedules/${scheduleId}`);

      return {
        success: true,
        data: response.data,
        message: 'Schedule deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check schedule conflicts
   * POST /schedules/check-conflicts
   * @param {Object} scheduleData - Schedule data to check for conflicts
   * @returns {Promise<{success: boolean, data?: {hasConflict: boolean, conflicts?: any[]}, error?: string}>}
   */
  checkConflicts: async (scheduleData) => {
    try {
      const response = await apiClient.post('/schedules/check-conflicts', scheduleData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Bulk create schedules
   * POST /schedules/bulk-create
   * @param {Object} schedulesData - Array of schedule data objects
   * @returns {Promise<{success: boolean, data?: ScheduleResponse[], message?: string, error?: string}>}
   */
  bulkCreate: async (schedulesData) => {
    try {
      const response = await apiClient.post('/schedules/bulk-create', schedulesData);

      return {
        success: true,
        data: response.data,
        message: 'Schedules created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get employee schedule summary
   * GET /schedules/employee/:employeeId/summary
   * @param {number} employeeId - Employee ID
   * @param {string} startDate - Start date (YYYY-MM-DD format)
   * @param {string} endDate - End date (YYYY-MM-DD format)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEmployeeSummary: async (employeeId, startDate, endDate) => {
    try {
      const response = await apiClient.get(`/schedules/employee/${employeeId}/summary`, {
        params: { startDate, endDate },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get weekly schedule view
   * GET /schedules/weekly
   * @param {string} weekStartDate - Start date of the week (YYYY-MM-DD format)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getWeekly: async (weekStartDate) => {
    try {
      const response = await apiClient.get('/schedules/weekly', {
        params: { weekStartDate },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
