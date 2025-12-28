import apiClient, { handleApiError } from './client';
import { appointmentApi } from './appointments';
import { scheduleApi } from './schedules';

/**
 * Care Staff API Functions
 * Provides specialized endpoints for care staff operations
 */
export const careStaffApi = {
  /**
   * Get today's tasks for a care staff member
   * @param {number} employeeId - Employee ID
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getTodayTasks: async (employeeId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get appointments for today for this employee
      const appointmentsResult = await appointmentApi.getAll({
        employeeId,
        date: today,
      });

      if (!appointmentsResult.success) {
        return appointmentsResult;
      }

      // Transform appointments to task format
      const tasks = appointmentsResult.data.map(appointment => ({
        id: appointment.appointmentId || appointment.id,
        appointmentId: appointment.appointmentId || appointment.id,
        time: appointment.startTime,
        type: 'service',
        title: `${appointment.service?.name || 'Service'} for ${appointment.pet?.name || 'Pet'}`,
        petName: appointment.pet?.name || 'Unknown',
        petType: appointment.pet?.species || 'Unknown',
        petId: appointment.petId,
        // Backend uses pet.owner, not pet.petOwner
        ownerName: appointment.pet?.owner?.fullName || 'Unknown',
        ownerPhone: appointment.pet?.owner?.phoneNumber || '',
        // Backend Service entity uses 'serviceName', not 'name'
        service: appointment.service?.serviceName || appointment.service?.name || 'Unknown Service',
        serviceId: appointment.serviceId,
        status: mapAppointmentStatusToTaskStatus(appointment.status),
        priority: 'normal',
        notes: appointment.notes || '',
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      }));

      return {
        success: true,
        data: tasks,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all tasks for a care staff member
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getAllTasks: async (employeeId, options = {}) => {
    try {
      const params = {
        employeeId,
        ...options,
      };

      const appointmentsResult = await appointmentApi.getAll(params);

      if (!appointmentsResult.success) {
        return appointmentsResult;
      }

      // Transform appointments to task format
      const tasks = appointmentsResult.data.map(appointment => ({
        id: appointment.id,
        appointmentId: appointment.id,
        time: appointment.startTime,
        petName: appointment.pet?.name || 'Unknown',
        petType: appointment.pet?.species || 'Unknown',
        petId: appointment.petId,
        ownerName: appointment.pet?.petOwner?.fullName || 'Unknown',
        ownerPhone: appointment.pet?.petOwner?.phoneNumber || '',
        service: appointment.service?.name || 'Unknown Service',
        serviceId: appointment.serviceId,
        status: mapAppointmentStatusToTaskStatus(appointment.status),
        priority: 'normal',
        notes: appointment.notes || '',
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      }));

      return {
        success: true,
        data: tasks,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get statistics for care staff dashboard
   * @param {number} employeeId - Employee ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getStatistics: async (employeeId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all appointments for today
      const appointmentsResult = await appointmentApi.getAll({
        employeeId,
        date: today,
      });

      if (!appointmentsResult.success) {
        return {
          success: true,
          data: {
            totalTasks: 0,
            inProgress: 0,
            completed: 0,
          },
        };
      }

      const appointments = appointmentsResult.data;
      const stats = {
        totalTasks: appointments.length,
        inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        pending: appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get schedule for a care staff member
   * @param {number} employeeId - Employee ID
   * @param {Object} params - Query parameters (date, startDate, endDate)
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getSchedule: async (employeeId, params = {}) => {
    try {
      let appointmentsResult;

      if (params.startDate && params.endDate) {
        // Get appointments by date range
        appointmentsResult = await appointmentApi.getByDateRange({
          employeeId,
          startDate: params.startDate,
          endDate: params.endDate,
        });
      } else {
        // Get appointments for a specific date or all appointments
        appointmentsResult = await appointmentApi.getAll({
          employeeId,
          date: params.date,
        });
      }

      if (!appointmentsResult.success) {
        return appointmentsResult;
      }

      // Transform appointments to schedule format
      const scheduleItems = appointmentsResult.data.map(appointment => ({
        id: appointment.id,
        appointmentId: appointment.id,
        time: appointment.startTime,
        date: appointment.appointmentDate,
        petName: appointment.pet?.name || 'Unknown',
        petType: appointment.pet?.species || 'Unknown',
        petId: appointment.petId,
        ownerName: appointment.pet?.petOwner?.fullName || 'Unknown',
        ownerPhone: appointment.pet?.petOwner?.phoneNumber || '',
        service: appointment.service?.name || 'Unknown Service',
        serviceId: appointment.serviceId,
        status: mapAppointmentStatusToTaskStatus(appointment.status),
        notes: appointment.notes || '',
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      }));

      return {
        success: true,
        data: scheduleItems,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Start a task (update appointment status to IN_PROGRESS)
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  startTask: async (appointmentId) => {
    try {
      // Backend uses PUT /appointments/:id/start endpoint
      const response = await apiClient.put(`/appointments/${appointmentId}/start`);

      return {
        success: true,
        data: response.data,
        message: 'Task started successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Complete a task (update appointment status to COMPLETED)
   * @param {number} appointmentId - Appointment ID
   * @param {string} notes - Completion notes
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  completeTask: async (appointmentId, notes = '') => {
    try {
      // Backend uses PUT /appointments/:id/complete endpoint
      const response = await apiClient.put(`/appointments/${appointmentId}/complete`, {
        notes,
      });

      return {
        success: true,
        data: response.data,
        message: 'Task completed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add notes to a task
   * @param {number} appointmentId - Appointment ID
   * @param {string} notes - Notes to add
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  addTaskNotes: async (appointmentId, notes) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, {
        notes,
      });

      return {
        success: true,
        data: response.data,
        message: 'Notes added successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get work schedule for a care staff member (from schedules API)
   * @param {number} employeeId - Employee ID
   * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getWorkSchedule: async (employeeId, date = null) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Use schedules API to get work schedule
      // Pass startDate and endDate as separate parameters
      const schedulesResult = await scheduleApi.getByEmployee(employeeId, targetDate, targetDate);

      if (!schedulesResult.success) {
        return schedulesResult;
      }

      // Get today's schedule (first one if multiple)
      const todaySchedule = schedulesResult.data && schedulesResult.data.length > 0
        ? schedulesResult.data[0]
        : null;

      return {
        success: true,
        data: todaySchedule,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Toggle employee availability status
   * @param {number} employeeId - Employee ID
   * @param {boolean} isAvailable - New availability status
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  toggleEmployeeStatus: async (employeeId, isAvailable) => {
    try {
      const endpoint = isAvailable
        ? `/employees/${employeeId}/available`
        : `/employees/${employeeId}/unavailable`;

      const response = await apiClient.put(endpoint);

      return {
        success: true,
        data: response.data,
        message: `Status updated to ${isAvailable ? 'available' : 'unavailable'}`,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Toggle schedule availability status
   * CARE_STAFF can toggle availability of their own schedules
   * @param {number} scheduleId - Schedule ID
   * @param {boolean} isAvailable - New availability status
   * @param {string} reason - Optional reason for unavailability
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  toggleScheduleAvailability: async (scheduleId, isAvailable, reason = '') => {
    try {
      // Backend uses PUT /schedules/:id/available or /schedules/:id/unavailable
      const endpoint = isAvailable
        ? `/schedules/${scheduleId}/available`
        : `/schedules/${scheduleId}/unavailable`;

      const body = isAvailable ? {} : { reason };
      const response = await apiClient.put(endpoint, body);

      return {
        success: true,
        data: response.data,
        message: `Schedule marked as ${isAvailable ? 'available' : 'unavailable'}`,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get work schedules for a date range
   * @param {number} employeeId - Employee ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getWorkScheduleRange: async (employeeId, startDate, endDate) => {
    try {
      const schedulesResult = await scheduleApi.getByEmployee(employeeId, startDate, endDate);
      return schedulesResult;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get employee details
   * @param {number} employeeId - Employee ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEmployeeDetails: async (employeeId) => {
    try {
      const response = await apiClient.get(`/employees/${employeeId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

/**
 * Helper function to map appointment status to task status
 * @param {string} appointmentStatus - Appointment status
 * @returns {string} Task status
 */
function mapAppointmentStatusToTaskStatus(appointmentStatus) {
  const statusMap = {
    'PENDING': 'pending',
    'CONFIRMED': 'pending',
    'IN_PROGRESS': 'in_progress',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
  };

  return statusMap[appointmentStatus] || 'pending';
}

/**
 * Helper function to map task status to appointment status
 * @param {string} taskStatus - Task status
 * @returns {string} Appointment status
 */
export function mapTaskStatusToAppointmentStatus(taskStatus) {
  const statusMap = {
    'pending': 'PENDING',
    'in_progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
  };

  return statusMap[taskStatus] || 'PENDING';
}

export default careStaffApi;
