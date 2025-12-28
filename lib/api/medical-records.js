import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreateMedicalRecordDto} CreateMedicalRecordDto
 * @typedef {import('./types').UpdateMedicalRecordDto} UpdateMedicalRecordDto
 * @typedef {import('./types').MedicalRecordResponse} MedicalRecordResponse
 */

/**
 * Medical Record API Functions
 * Base path: /medical-records
 */
export const medicalRecordApi = {
  /**
   * Create a new medical record
   * POST /medical-records
   * @param {CreateMedicalRecordDto} recordData - Medical record data including pet ID, diagnosis, treatment, etc.
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse, message?: string, error?: string}>}
   */
  create: async (recordData) => {
    try {
      const response = await apiClient.post('/medical-records', recordData);

      return {
        success: true,
        data: response.data,
        message: 'Medical record created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all medical records
   * GET /medical-records
   * @param {Object} [params={}] - Query parameters for filtering
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/medical-records', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get medical record by ID
   * GET /medical-records/:id
   * @param {number} recordId - Medical record ID
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse, error?: string}>}
   */
  getById: async (recordId) => {
    try {
      const response = await apiClient.get(`/medical-records/${recordId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get medical records by pet ID
   * GET /medical-records/pet/:petId
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse[], error?: string}>}
   */
  getByPet: async (petId) => {
    try {
      const response = await apiClient.get(`/medical-records/pet/${petId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get medical records by veterinarian ID
   * GET /medical-records/by-veterinarian/:vetId
   * @param {number} vetId - Veterinarian ID
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse[], error?: string}>}
   */
  getByVeterinarian: async (vetId) => {
    try {
      const response = await apiClient.get(`/medical-records/by-veterinarian/${vetId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get medical records requiring follow-up
   * GET /medical-records/follow-up-required
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse[], error?: string}>}
   */
  getFollowUpRequired: async () => {
    try {
      const response = await apiClient.get('/medical-records/follow-up-required');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get overdue follow-up records
   * GET /medical-records/overdue-followups
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse[], error?: string}>}
   */
  getOverdueFollowUps: async () => {
    try {
      const response = await apiClient.get('/medical-records/overdue-followups');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update medical record
   * PUT /medical-records/:id
   * @param {number} recordId - Medical record ID
   * @param {UpdateMedicalRecordDto} recordData - Updated medical record data
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse, message?: string, error?: string}>}
   */
  update: async (recordId, recordData) => {
    try {
      const response = await apiClient.put(`/medical-records/${recordId}`, recordData);

      return {
        success: true,
        data: response.data,
        message: 'Medical record updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete medical record
   * DELETE /medical-records/:id
   * @param {number} recordId - Medical record ID to delete
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  remove: async (recordId) => {
    try {
      const response = await apiClient.delete(`/medical-records/${recordId}`);

      return {
        success: true,
        data: response.data,
        message: 'Medical record deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get vaccination history for a pet
   * GET /medical-records/pet/:petId/vaccinations
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getVaccinationHistory: async (petId) => {
    try {
      const response = await apiClient.get(`/medical-records/pet/${petId}/vaccinations`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add vaccination record
   * POST /medical-records/pet/:petId/vaccinations
   * @param {number} petId - Pet ID
   * @param {Object} vaccinationData - Vaccination data including vaccine name, date, next due date, etc.
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  addVaccination: async (petId, vaccinationData) => {
    try {
      const response = await apiClient.post(`/medical-records/pet/${petId}/vaccinations`, vaccinationData);

      return {
        success: true,
        data: response.data,
        message: 'Vaccination record added successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get upcoming vaccinations due
   * GET /medical-records/vaccinations/upcoming-due
   * @param {Object} [params={}] - Query parameters for filtering
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getUpcomingVaccinations: async (params = {}) => {
    try {
      const response = await apiClient.get('/medical-records/vaccinations/upcoming-due', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Search medical records
   * GET /medical-records/search
   * @param {Object} searchParams - Search parameters (keyword, petId, diagnosis, dateRange, etc.)
   * @returns {Promise<{success: boolean, data?: MedicalRecordResponse[], error?: string}>}
   */
  search: async (searchParams) => {
    try {
      const response = await apiClient.get('/medical-records/search', { params: searchParams });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Export medical record to PDF
   * GET /medical-records/:id/export-pdf
   * @param {number} recordId - Medical record ID
   * @returns {Promise<{success: boolean, data?: Blob, error?: string}>}
   */
  exportPdf: async (recordId) => {
    try {
      const response = await apiClient.get(`/medical-records/${recordId}/export-pdf`, {
        responseType: 'blob',
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
   * Get all vaccine types for dropdown
   * GET /vaccine-types
   * @returns {Promise<{success: boolean, data?: VaccineType[], error?: string}>}
   */
  getVaccineTypes: async () => {
    try {
      const response = await apiClient.get('/vaccine-types');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
