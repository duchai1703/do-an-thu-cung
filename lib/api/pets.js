import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreatePetDto} CreatePetDto
 * @typedef {import('./types').UpdatePetDto} UpdatePetDto
 * @typedef {import('./types').PetResponse} PetResponse
 */

/**
 * Pet API Functions
 * Base path: /pets
 */
export const petApi = {
  /**
   * Register a new pet
   * POST /pets?ownerId=X
   * @param {CreatePetDto} petData - Pet registration data (name, species, breed, birthDate, etc.)
   * @param {number} ownerId - Pet owner ID (required)
   * @returns {Promise<{success: boolean, data?: PetResponse, message?: string, error?: string}>}
   */
  create: async (petData, ownerId) => {
    try {
      const response = await apiClient.post('/pets', petData, {
        params: { ownerId }
      });

      return {
        success: true,
        data: response.data,
        message: 'Pet registered successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all pets
   * GET /pets
   * @param {Object} [params={}] - Query parameters for filtering
   * @returns {Promise<{success: boolean, data?: PetResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/pets', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get pet by ID
   * GET /pets/:id
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: PetResponse, error?: string}>}
   */
  getById: async (petId) => {
    try {
      const response = await apiClient.get(`/pets/${petId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get pets by owner ID
   * GET /pets/owner/:ownerId
   * @param {number} ownerId - Pet owner ID
   * @returns {Promise<{success: boolean, data?: PetResponse[], error?: string}>}
   */
  getByOwner: async (ownerId) => {
    try {
      const response = await apiClient.get(`/pets/owner/${ownerId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update pet details
   * PUT /pets/:id
   * @param {number} petId - Pet ID
   * @param {UpdatePetDto} petData - Pet update data
   * @returns {Promise<{success: boolean, data?: PetResponse, message?: string, error?: string}>}
   */
  update: async (petId, petData) => {
    try {
      const response = await apiClient.put(`/pets/${petId}`, petData);

      return {
        success: true,
        data: response.data,
        message: 'Pet updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete pet
   * DELETE /pets/:id
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  delete: async (petId) => {
    try {
      const response = await apiClient.delete(`/pets/${petId}`);

      return {
        success: true,
        data: response.data,
        message: 'Pet deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Search pets by criteria
   * GET /pets/search
   * @param {Object} searchParams - Search parameters (name, species, ownerId, etc.)
   * @returns {Promise<{success: boolean, data?: PetResponse[], error?: string}>}
   */
  search: async (searchParams) => {
    try {
      const response = await apiClient.get('/pets/search', { params: searchParams });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get pet's medical history
   * GET /pets/:id/medical-history
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getMedicalHistory: async (petId) => {
    try {
      const response = await apiClient.get(`/pets/${petId}/medical-history`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get pet's appointment history
   * GET /pets/:id/appointments
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getAppointments: async (petId) => {
    try {
      const response = await apiClient.get(`/pets/${petId}/appointments`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ===== VACCINATION APIs =====

  /**
   * Get pet's vaccination history
   * GET /pets/:petId/vaccinations
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getVaccinations: async (petId) => {
    try {
      const response = await apiClient.get(`/pets/${petId}/vaccinations`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add a vaccination record for a pet
   * POST /pets/:petId/vaccinations
   * @param {number} petId - Pet ID
   * @param {Object} vaccinationData - Vaccination data (vaccineTypeId, administratorId, batchNumber, nextDueDate, notes)
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  addVaccination: async (petId, vaccinationData) => {
    try {
      const response = await apiClient.post(`/pets/${petId}/vaccinations`, vaccinationData);

      return {
        success: true,
        data: response.data,
        message: 'Vaccination recorded successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get upcoming vaccinations for a pet
   * GET /pets/:petId/vaccinations/upcoming
   * @param {number} petId - Pet ID
   * @param {number} [days=30] - Days ahead to check
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getUpcomingVaccinations: async (petId, days = 30) => {
    try {
      const response = await apiClient.get(`/pets/${petId}/vaccinations/upcoming`, {
        params: { days }
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
   * Get overdue vaccinations for a pet
   * GET /pets/:petId/vaccinations/overdue
   * @param {number} petId - Pet ID
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  getOverdueVaccinations: async (petId) => {
    try {
      const response = await apiClient.get(`/pets/${petId}/vaccinations/overdue`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
