/**
 * Error Handler - Centralized error handling utilities
 * Provides consistent error messages and error categorization
 */

/**
 * Error type enumeration
 */
export const ErrorType = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * User-friendly error messages in Vietnamese
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
  OFFLINE: 'Bạn đang offline. Vui lòng kiểm tra kết nối internet.',
  TIMEOUT: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',

  // Authentication errors
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này.',
  FORBIDDEN: 'Truy cập bị từ chối.',

  // Validation errors
  INVALID_EMAIL: 'Email không hợp lệ.',
  INVALID_PHONE: 'Số điện thoại không hợp lệ.',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
  EMAIL_EXISTS: 'Email này đã được đăng ký.',
  PHONE_EXISTS: 'Số điện thoại này đã được đăng ký.',
  REQUIRED_FIELD: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
  INVALID_INPUT: 'Dữ liệu nhập vào không hợp lệ.',

  // Email-related errors
  EMAIL_SEND_FAILED: 'Không thể gửi email. Vui lòng thử lại sau.',
  EMAIL_NOT_FOUND: 'Email không tồn tại trong hệ thống.',
  EMAIL_NOT_VERIFIED: 'Email chưa được xác thực.',

  // Resource errors
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  RESOURCE_NOT_FOUND: 'Tài nguyên không tồn tại.',
  
  // Server errors
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  INTERNAL_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng.',

  // Payment errors
  PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại.',
  PAYMENT_CANCELLED: 'Thanh toán đã bị hủy.',
  INVALID_PAYMENT: 'Thông tin thanh toán không hợp lệ.',

  // Generic
  UNKNOWN_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  OPERATION_FAILED: 'Thao tác không thành công.',
};

/**
 * Handle and categorize API errors
 * @param {Error} error - Error object
 * @returns {Object} Processed error with type and message
 */
export function handleError(error) {
  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      type: ErrorType.NETWORK,
      message: ERROR_MESSAGES.OFFLINE,
      originalError: error,
    };
  }

  // Handle APIError instances (from api-client.js)
  if (error.name === 'APIError') {
    const status = error.status;

    // Authentication errors (401)
    if (status === 401) {
      return {
        type: ErrorType.AUTH,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
        originalError: error,
      };
    }

    // Forbidden (403)
    if (status === 403) {
      return {
        type: ErrorType.AUTH,
        message: ERROR_MESSAGES.FORBIDDEN,
        originalError: error,
      };
    }

    // Not Found (404)
    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        message: error.message || ERROR_MESSAGES.NOT_FOUND,
        originalError: error,
      };
    }

    // Validation errors (400)
    if (status === 400) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || ERROR_MESSAGES.INVALID_INPUT,
        originalError: error,
      };
    }

    // Server errors (500+)
    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: ERROR_MESSAGES.SERVER_ERROR,
        originalError: error,
      };
    }

    // Network error (status 0)
    if (status === 0) {
      return {
        type: ErrorType.NETWORK,
        message: ERROR_MESSAGES.NETWORK_ERROR,
        originalError: error,
      };
    }

    // Other errors
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      originalError: error,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      originalError: error,
    };
  }

  // Fallback
  return {
    type: ErrorType.UNKNOWN,
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    originalError: error,
  };
}

/**
 * Get user-friendly message for specific error scenarios
 * @param {string} errorCode - Error code from backend
 * @returns {string} User-friendly message
 */
export function getErrorMessage(errorCode) {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Log error for debugging (only in development)
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 */
export function logError(context, error) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
}

/**
 * Format validation errors from backend
 * @param {Object} validationErrors - Validation errors object
 * @returns {Object} Formatted errors by field
 */
export function formatValidationErrors(validationErrors) {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return {};
  }

  const formatted = {};
  
  Object.keys(validationErrors).forEach(field => {
    const errors = validationErrors[field];
    formatted[field] = Array.isArray(errors) ? errors[0] : errors;
  });

  return formatted;
}

/**
 * Check if error is network related
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  const handled = handleError(error);
  return handled.type === ErrorType.NETWORK;
}

/**
 * Check if error is authentication related
 * @param {Error} error - Error object
 * @returns {boolean} True if auth error
 */
export function isAuthError(error) {
  const handled = handleError(error);
  return handled.type === ErrorType.AUTH;
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth or validation errors
      if (isAuthError(error) || handleError(error).type === ErrorType.VALIDATION) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default {
  ErrorType,
  ERROR_MESSAGES,
  handleError,
  getErrorMessage,
  logError,
  formatValidationErrors,
  isNetworkError,
  isAuthError,
  retryWithBackoff,
};
