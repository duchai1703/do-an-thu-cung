import apiClient, { handleApiError } from './client';

/**
 * @typedef {import('./types').CreatePaymentDto} CreatePaymentDto
 * @typedef {import('./types').PaymentResponse} PaymentResponse
 * @typedef {import('./types').PaymentStatus} PaymentStatus
 * @typedef {import('./types').PaymentMethod} PaymentMethod
 * @typedef {import('./types').GetPaymentsQuery} GetPaymentsQuery
 */

/**
 * Payment API Functions
 * Base path: /payments
 */
export const paymentApi = {
  /**
   * Create a new payment
   * POST /payments
   * @param {CreatePaymentDto} paymentData - Payment data including invoice ID, amount, payment method, etc.
   * @returns {Promise<{success: boolean, data?: PaymentResponse, message?: string, error?: string}>}
   */
  create: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments', paymentData);

      return {
        success: true,
        data: response.data,
        message: 'Payment created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all payments
   * GET /payments
   * @param {GetPaymentsQuery} [params={}] - Query parameters for filtering (status, method, startDate, endDate)
   * @returns {Promise<{success: boolean, data?: PaymentResponse[], error?: string}>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/payments', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get payment by ID
   * GET /payments/:id
   * @param {number} paymentId - Payment ID
   * @returns {Promise<{success: boolean, data?: PaymentResponse, error?: string}>}
   */
  getById: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get payments by invoice ID
   * GET /payments/by-invoice/:invoiceId
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<{success: boolean, data?: PaymentResponse[], error?: string}>}
   */
  getByInvoice: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/payments/by-invoice/${invoiceId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get payment history with filters
   * GET /payments/history
   * @param {Object} queryParams - Query parameters for filtering payment history
   * @returns {Promise<{success: boolean, data?: PaymentResponse[], error?: string}>}
   */
  getHistory: async (queryParams) => {
    try {
      const response = await apiClient.get('/payments/history', { params: queryParams });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Initiate online payment (VNPay, Momo, ZaloPay)
   * POST /payments/initiate-online
   * @param {Object} paymentData - Online payment data including provider, amount, etc.
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  initiateOnline: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments/initiate-online', paymentData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create VNPay payment URL
   * POST /payments/vnpay/create-url
   * @param {Object} paymentData - VNPay payment data
   * @returns {Promise<{success: boolean, data?: {paymentUrl: string}, error?: string}>}
   */
  createVNPayUrl: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments/vnpay/create-url', paymentData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Handle VNPay return callback
   * GET /payments/vnpay/return
   * @param {Object} callbackParams - VNPay callback parameters from redirect
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  handleVNPayReturn: async (callbackParams) => {
    try {
      const response = await apiClient.get('/payments/vnpay/return', { params: callbackParams });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Process refund for a payment
   * POST /payments/:id/refund
   * @param {number} paymentId - Payment ID to refund
   * @param {Object} refundData - Refund data including amount and reason
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  processRefund: async (paymentId, refundData) => {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/refund`, refundData);

      return {
        success: true,
        data: response.data,
        message: 'Refund processed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update payment status
   * PUT /payments/:id/status
   * @param {number} paymentId - Payment ID
   * @param {string} status - New payment status (PENDING, COMPLETED, FAILED, REFUNDED)
   * @returns {Promise<{success: boolean, data?: PaymentResponse, message?: string, error?: string}>}
   */
  updateStatus: async (paymentId, status) => {
    try {
      const response = await apiClient.put(`/payments/${paymentId}/status`, { status });

      return {
        success: true,
        data: response.data,
        message: 'Payment status updated',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete payment
   * DELETE /payments/:id
   * @param {number} paymentId - Payment ID to delete
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
   */
  delete: async (paymentId) => {
    try {
      const response = await apiClient.delete(`/payments/${paymentId}`);

      return {
        success: true,
        data: response.data,
        message: 'Payment deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Verify payment transaction
   * GET /payments/:id/verify
   * @param {number} paymentId - Payment ID to verify
   * @returns {Promise<{success: boolean, data?: {verified: boolean, status: string}, error?: string}>}
   */
  verify: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/verify`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
