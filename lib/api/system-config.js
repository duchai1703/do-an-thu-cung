import apiClient, { handleApiError } from './client';

/**
 * System Config API Functions
 * Base path: /system-config
 */
export const systemConfigApi = {
  /**
   * Get all system configurations
   * GET /system-config
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/system-config');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get configuration by key
   * GET /system-config/key/:key
   * @param {string} key - Configuration key
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  getByKey: async (key) => {
    try {
      const response = await apiClient.get(`/system-config/key/${key}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get persistent days off (0=Sunday, 6=Saturday)
   * GET /system-config/persistent-days-off
   * @returns {Promise<{success: boolean, data?: Array<number>, error?: string}>}
   */
  getPersistentDaysOff: async () => {
    try {
      const response = await apiClient.get('/system-config/persistent-days-off');

      return {
        success: true,
        data: response.data, // Array of day numbers [0-6]
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Set persistent days off (0=Sunday, 6=Saturday)
   * PUT /system-config/persistent-days-off
   * @param {Array<number>} daysOff - Array of day numbers (0=Sunday, 6=Saturday)
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  setPersistentDaysOff: async (daysOff) => {
    try {
      const response = await apiClient.put('/system-config/persistent-days-off', {
        daysOff,
      });

      return {
        success: true,
        data: response.data,
        message: 'Persistent days off updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new system configuration
   * POST /system-config
   * @param {Object} configData - Configuration data
   * @param {string} configData.configKey - Unique configuration key
   * @param {string} configData.configValue - Configuration value (JSON string)
   * @param {string} [configData.description] - Description
   * @param {boolean} [configData.isActive] - Whether config is active (default: true)
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  create: async (configData) => {
    try {
      const response = await apiClient.post('/system-config', configData);

      return {
        success: true,
        data: response.data,
        message: 'Configuration created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update an existing system configuration
   * PUT /system-config/:id
   * @param {number} id - Configuration ID
   * @param {Object} updateData - Updated configuration data
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/system-config/${id}`, updateData);

      return {
        success: true,
        data: response.data,
        message: 'Configuration updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a system configuration
   * DELETE /system-config/:id
   * @param {number} id - Configuration ID
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  delete: async (id) => {
    try {
      await apiClient.delete(`/system-config/${id}`);

      return {
        success: true,
        message: 'Configuration deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
