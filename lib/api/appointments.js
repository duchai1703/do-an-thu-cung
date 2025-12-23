import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreateAppointmentDto} CreateAppointmentDto
 * @typedef {import('./types').UpdateAppointmentDto} UpdateAppointmentDto
 * @typedef {import('./types').AppointmentResponse} AppointmentResponse
 * @typedef {import('./types').AppointmentStatus} AppointmentStatus
 * @typedef {import('./types').GetAppointmentsQuery} GetAppointmentsQuery
 * @typedef {import('./types').GetAppointmentsByDateRangeQuery} GetAppointmentsByDateRangeQuery
 * @typedef {import('./types').GetAppointmentsByStatusQuery} GetAppointmentsByStatusQuery
 */

/**
 * Appointment API Functions
 * Base path: /appointments
 */
export const appointmentApi = {
  /**
   * Create a new appointment
   * POST /appointments
   * @param {CreateAppointmentDto} appointmentData - Appointment data (petId, employeeId, serviceId, appointmentDate, startTime, endTime)
   * @returns {Promise<{success: boolean, data?: AppointmentResponse, message?: string, error?: string}>}
   */
  create: async (appointmentData) => {
    try {
      const response = await apiClient.post('/appointments', appointmentData);

      return {
        success: true,
        data: response.data,
        message: 'Appointment created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all appointments
   * GET /appointments
   * @param {GetAppointmentsQuery} [params={}] - Query parameters for filtering (status, petId, employeeId, date)
   * @returns {Promise<{success: boolean, data?: AppointmentResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/appointments', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get appointment by ID
   * GET /appointments/:id
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<{success: boolean, data?: AppointmentResponse, error?: string}>}
   */
  getById: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get appointments by status
   * GET /appointments/by-status
   * @param {AppointmentStatus} status - Appointment status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
   * @returns {Promise<{success: boolean, data?: AppointmentResponse[], error?: string}>}
   */
  getByStatus: async (status) => {
    try {
      const response = await apiClient.get('/appointments/by-status', {
        params: { status },
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
   * Get appointments by pet ID
   * GET /appointments/by-pet/:petId
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: AppointmentResponse[], error?: string}>}
   */
  getByPet: async (petId) => {
    try {
      const response = await apiClient.get(`/appointments/by-pet/${petId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get appointments by employee ID
   * GET /appointments/by-employee/:employeeId
   * @param {number} employeeId - Employee ID
   * @returns {Promise<{success: boolean, data?: AppointmentResponse[], error?: string}>}
   */
  getByEmployee: async (employeeId) => {
    try {
      const response = await apiClient.get(`/appointments/by-employee/${employeeId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get appointments by date range
   * GET /appointments/by-date-range
   * @param {GetAppointmentsByDateRangeQuery} params - Query parameters (startDate, endDate, employeeId?)
   * @returns {Promise<{success: boolean, data?: AppointmentResponse[], error?: string}>}
   */
  getByDateRange: async (params) => {
    try {
      const response = await apiClient.get('/appointments/by-date-range', {
        params,
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
   * Update appointment
   * PUT /appointments/:id
   * @param {number} appointmentId - Appointment ID
   * @param {UpdateAppointmentDto} appointmentData - Appointment update data
   * @returns {Promise<{success: boolean, data?: AppointmentResponse, message?: string, error?: string}>}
   */
  update: async (appointmentId, appointmentData) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, appointmentData);

      return {
        success: true,
        data: response.data,
        message: 'Appointment updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cancel appointment
   * PUT /appointments/:id/cancel
   * @param {number} appointmentId - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<{success: boolean, data?: AppointmentResponse, message?: string, error?: string}>}
   */
  cancel: async (appointmentId, reason) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/cancel`, { reason });

      return {
        success: true,
        data: response.data,
        message: 'Appointment cancelled successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Confirm appointment
   * PUT /appointments/:id/confirm
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<{success: boolean, data?: AppointmentResponse, message?: string, error?: string}>}
   */
  confirm: async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/confirm`);

      return {
        success: true,
        data: response.data,
        message: 'Appointment confirmed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Complete appointment
   * PUT /appointments/:id/complete
   * @param {number} appointmentId - Appointment ID
   * @param {Object} completionData - Completion data (actualCost, notes, etc.)
   * @returns {Promise<{success: boolean, data?: AppointmentResponse, message?: string, error?: string}>}
   */
  complete: async (appointmentId, completionData) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/complete`, completionData);

      return {
        success: true,
        data: response.data,
        message: 'Appointment completed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete appointment
   * DELETE /appointments/:id
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  delete: async (appointmentId) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`);

      return {
        success: true,
        data: response.data,
        message: 'Appointment deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Check appointment availability
   * POST /appointments/check-availability
   * @param {Object} availabilityData - Availability check data (date, startTime, endTime, employeeId)
   * @returns {Promise<{success: boolean, data?: {available: boolean, conflicts?: any[]}, error?: string}>}
   */
  checkAvailability: async (availabilityData) => {
    try {
      const response = await apiClient.post('/appointments/check-availability', availabilityData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
