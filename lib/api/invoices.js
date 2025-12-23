import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreateInvoiceDto} CreateInvoiceDto
 * @typedef {import('./types').UpdateInvoiceDto} UpdateInvoiceDto
 * @typedef {import('./types').InvoiceResponse} InvoiceResponse
 * @typedef {import('./types').InvoiceStatus} InvoiceStatus
 * @typedef {import('./types').GetInvoicesQuery} GetInvoicesQuery
 */

/**
 * Invoice API Functions
 * Base path: /invoices
 */
export const invoiceApi = {
  /**
   * Create a new invoice
   * POST /invoices
   * @param {CreateInvoiceDto} invoiceData - Invoice data including customer ID, items, amounts, etc.
   * @returns {Promise<{success: boolean, data?: InvoiceResponse, message?: string, error?: string}>}
   */
  create: async (invoiceData) => {
    try {
      const response = await apiClient.post('/invoices', invoiceData);

      return {
        success: true,
        data: response.data,
        message: 'Invoice created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all invoices
   * GET /invoices
   * @param {GetInvoicesQuery} [params={}] - Query parameters for filtering (status, startDate, endDate)
   * @returns {Promise<{success: boolean, data?: InvoiceResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/invoices', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoice by ID
   * GET /invoices/:id
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<{success: boolean, data?: InvoiceResponse, error?: string}>}
   */
  getById: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoices by customer (pet owner) ID
   * GET /invoices/by-customer/:customerId
   * @param {number} customerId - Customer/Pet owner ID
   * @returns {Promise<{success: boolean, data?: InvoiceResponse[], error?: string}>}
   */
  getByCustomer: async (customerId) => {
    try {
      const response = await apiClient.get(`/invoices/by-customer/${customerId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoices by appointment ID
   * GET /invoices/by-appointment/:appointmentId
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<{success: boolean, data?: InvoiceResponse[], error?: string}>}
   */
  getByAppointment: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/invoices/by-appointment/${appointmentId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get invoices by status
   * GET /invoices/by-status
   * @param {string} status - Invoice status (PENDING, PAID, CANCELLED, OVERDUE)
   * @returns {Promise<{success: boolean, data?: InvoiceResponse[], error?: string}>}
   */
  getByStatus: async (status) => {
    try {
      const response = await apiClient.get('/invoices/by-status', { params: { status } });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get pending invoices
   * GET /invoices/pending
   * @returns {Promise<{success: boolean, data?: InvoiceResponse[], error?: string}>}
   */
  getPending: async () => {
    try {
      const response = await apiClient.get('/invoices/pending');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update invoice
   * PUT /invoices/:id
   * @param {number} invoiceId - Invoice ID
   * @param {UpdateInvoiceDto} invoiceData - Updated invoice data
   * @returns {Promise<{success: boolean, data?: InvoiceResponse, message?: string, error?: string}>}
   */
  update: async (invoiceId, invoiceData) => {
    try {
      const response = await apiClient.put(`/invoices/${invoiceId}`, invoiceData);

      return {
        success: true,
        data: response.data,
        message: 'Invoice updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Calculate invoice total
   * POST /invoices/calculate-total
   * @param {Object} invoiceData - Invoice data with items to calculate total
   * @returns {Promise<{success: boolean, data?: {total: number, subtotal: number, tax: number, discount: number}, error?: string}>}
   */
  calculateTotal: async (invoiceData) => {
    try {
      const response = await apiClient.post('/invoices/calculate-total', invoiceData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark invoice as paid
   * PUT /invoices/:id/mark-paid
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<{success: boolean, data?: InvoiceResponse, message?: string, error?: string}>}
   */
  markAsPaid: async (invoiceId) => {
    try {
      const response = await apiClient.put(`/invoices/${invoiceId}/mark-paid`);

      return {
        success: true,
        data: response.data,
        message: 'Invoice marked as paid',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete invoice
   * DELETE /invoices/:id
   * @param {number} invoiceId - Invoice ID to delete
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  delete: async (invoiceId) => {
    try {
      const response = await apiClient.delete(`/invoices/${invoiceId}`);

      return {
        success: true,
        data: response.data,
        message: 'Invoice deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Generate invoice PDF
   * GET /invoices/:id/pdf
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<{success: boolean, data?: Blob, error?: string}>}
   */
  generatePdf: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/pdf`, {
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
   * Send invoice via email
   * POST /invoices/:id/send-email
   * @param {number} invoiceId - Invoice ID
   * @param {Object} emailData - Email data including recipient, subject, message
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  sendEmail: async (invoiceId, emailData) => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/send-email`, emailData);

      return {
        success: true,
        data: response.data,
        message: 'Invoice sent via email',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
