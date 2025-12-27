import apiClient, { setToken, removeToken, handleApiError } from './client';
import { UserRole, Messages } from '../utils/constants';
import { Account } from '../models/Account';
import { formatAccountId, formatOwnerId } from '../utils/id-formatter';

/**
 * @typedef {import('./types').LoginResponse} LoginResponse
 * @typedef {import('./types').AccountResponse} AccountResponse
 * @typedef {import('./types').RegisterDto} RegisterDto
 * @typedef {import('./types').UpdateProfileDto} UpdateProfileDto
 * @typedef {import('./types').ChangePasswordDto} ChangePasswordDto
 * @typedef {import('./types').ApiResponse} ApiResponse
 */

// ============================================================================
// REAL API FUNCTIONS (Use these for production)
// ============================================================================

export const authApi = {
  /**
   * Login user with email and password
   * POST /auth/login
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, data?: LoginResponse, error?: string, statusCode?: number}>}
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      // Store token if login successful
      if (response.data?.accessToken) {
        setToken(response.data.accessToken);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout current user
   * POST /auth/logout
   * @returns {Promise<{success: boolean, message: string}>}
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      removeToken();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Even if API call fails, remove token locally
      removeToken();
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  },

  /**
   * Register a new pet owner account
   * POST /pet-owners/register
   * @param {Object} userData - Registration data: email, password, fullName, phoneNumber, address?, preferredContactMethod?
   * @returns {Promise<{success: boolean, data?: Object, error?: string, statusCode?: number}>}
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/pet-owners/register', userData);

      return {
        success: true,
        data: response.data,
        message: 'Đăng ký thành công!',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get account details by ID
   * GET /auth/account/:id
   * @param {number} accountId - Account ID
   * @returns {Promise<{success: boolean, data?: AccountResponse, error?: string, statusCode?: number}>}
   */
  getAccount: async (accountId) => {
    try {
      const response = await apiClient.get(`/auth/account/${accountId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get full profile including related data (pet owner or employee details)
   * GET /auth/account/:id/full-profile
   * @param {number} accountId - Account ID
   * @returns {Promise<{success: boolean, data?: AccountResponse, error?: string, statusCode?: number}>}
   */
  getFullProfile: async (accountId) => {
    try {
      const response = await apiClient.get(`/auth/account/${accountId}/full-profile`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update account profile
   * PUT /auth/account/:id
   * @param {number} accountId - Account ID
   * @param {UpdateProfileDto} profileData - Profile update data
   * @returns {Promise<{success: boolean, data?: AccountResponse, error?: string, statusCode?: number}>}
   */
  updateProfile: async (accountId, profileData) => {
    try {
      const response = await apiClient.put(`/auth/account/${accountId}`, profileData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Change account password
   * PUT /auth/account/:id/change-password
   * @param {number} accountId - Account ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password (min 8 characters)
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string, statusCode?: number}>}
   */
  changePassword: async (accountId, oldPassword, newPassword) => {
    try {
      const response = await apiClient.put(`/auth/account/${accountId}/change-password`, {
        oldPassword,
        newPassword,
      });

      return {
        success: true,
        data: response.data,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Initiate password reset
   * POST /auth/reset-password
   * @param {string} email - User email address
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string, statusCode?: number}>}
   */
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email });

      return {
        success: true,
        data: response.data,
        message: 'Password reset instructions sent to email',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete account (soft delete)
   * DELETE /auth/account/:id
   * @param {number} accountId - Account ID
   * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string, statusCode?: number}>}
   */
  deleteAccount: async (accountId) => {
    try {
      const response = await apiClient.delete(`/auth/account/${accountId}`);

      return {
        success: true,
        data: response.data,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   * @returns {Promise<{success: boolean, data?: AccountResponse, error?: string, statusCode?: number}>}
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================================================
// MOCK API FUNCTIONS (Keep for backward compatibility - legacy support)
// ============================================================================

/**
 * Mock database - In production, this would be replaced with actual API calls
 */
const mockDatabase = {
  accounts: [
    new Account({
      accountID: 'ACC001',
      email: 'manager@pawlovers.com',
      passwordHash: 'Manager@123',
      role: UserRole.MANAGER
    }),
    new Account({
      accountID: 'ACC002',
      email: 'vet@pawlovers.com',
      passwordHash: 'Vet@123',
      role: UserRole.VETERINARIAN
    }),
    new Account({
      accountID: 'ACC003',
      email: 'petowner@pawlovers.com',
      passwordHash: 'PetOwner@123',
      role: UserRole.PET_OWNER
    }),
    new Account({
      accountID: 'ACC004',
      email: 'staff@pawlovers.com',
      passwordHash: 'Staff@123',
      role: UserRole.CARE_STAFF
    }),
    new Account({
      accountID: 'ACC005',
      email: 'receptionist@pawlovers.com',
      passwordHash: 'Reception@123',
      role: UserRole.RECEPTIONIST
    }),
  ],
  petOwners: []
};

/**
 * API: Register new pet owner account (UC-02) - Mock Version (Legacy)
 * @param {Object} data - Registration data
 * @returns {Promise<Object>}
 */
export async function registerMock(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if email already exists
      const existingAccount = mockDatabase.accounts.find(
        acc => acc.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingAccount) {
        resolve({
          success: false,
          message: '❌ Email này đã được đăng ký. Vui lòng sử dụng email khác.'
        });
        return;
      }

      // Create new account
      const newAccount = new Account({
        accountID: formatAccountId(mockDatabase.accounts.length + 1),
        email: data.email,
        passwordHash: data.password, // In production: hash password
        role: UserRole.PET_OWNER,
        isActive: true
      });

      mockDatabase.accounts.push(newAccount);

      // Create associated PetOwner record
      mockDatabase.petOwners.push({
        ownerID: formatOwnerId(mockDatabase.petOwners.length + 1),
        name: data.fullName,
        phone: data.phone,
        account: newAccount,
        pets: []
      });

      console.log('✅ Đăng ký thành công:', {
        account: newAccount.toJSON(),
        fullName: data.fullName,
        phone: data.phone
      });

      resolve({
        success: true,
        message: Messages.AUTH.REGISTER_SUCCESS,
        data: newAccount.toJSON()
      });
    }, 800); // Simulate network delay
  });
}

/**
 * API: Login to system (UC-05) - Mock Version (Legacy)
 * @param {Object} credentials - Login credentials {email, password}
 * @returns {Promise<Object>}
 */
export async function loginMock(credentials) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = mockDatabase.accounts.find(
        acc => acc.email.toLowerCase() === credentials.email.toLowerCase()
      );

      if (!account) {
        resolve({
          success: false,
          message: Messages.AUTH.LOGIN_FAILED
        });
        return;
      }

      if (!account.validateCredentials(credentials.email, credentials.password)) {
        resolve({
          success: false,
          message: Messages.AUTH.LOGIN_FAILED
        });
        return;
      }

      if (!account.isAccountActive()) {
        resolve({
          success: false,
          message: '❌ Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
        });
        return;
      }

      console.log('✅ Đăng nhập thành công:', account.toJSON());

      resolve({
        success: true,
        message: Messages.AUTH.LOGIN_SUCCESS,
        data: {
          account: account.toJSON(),
          redirectTo: account.getDashboardRoute()
        }
      });
    }, 600);
  });
}

/**
 * API: Request password reset (UC-06) - Mock Version (Legacy)
 * @param {Object} data - Email data
 * @returns {Promise<Object>}
 */
export async function resetPasswordMock(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = mockDatabase.accounts.find(
        acc => acc.email.toLowerCase() === data.email.toLowerCase()
      );

      if (!account) {
        resolve({
          success: false,
          message: Messages.AUTH.RESET_PASSWORD_FAILED
        });
        return;
      }

      console.log('📧 Email khôi phục mật khẩu được gửi đến:', data.email);

      resolve({
        success: true,
        message: Messages.AUTH.RESET_PASSWORD_SENT
      });
    }, 700);
  });
}

/**
 * Helper: Get all mock accounts (for testing)
 */
export function getMockAccounts() {
  return mockDatabase.accounts.map(acc => ({
    email: acc.email,
    password: acc.passwordHash,
    role: acc.role
  }));
}