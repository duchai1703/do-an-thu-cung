/**
 * Forgot Password Form Component
 * Allows users to request password reset email
 */
'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function ForgotPasswordForm({ onSubmit, loading = false }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Vui lòng nhập email';
    }
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Call parent submit handler
    onSubmit(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Input */}
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your.email@example.com"
            disabled={loading}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg
              focus:outline-none focus:ring-2 transition-colors
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
            required
            autoFocus
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !email}
        className={`
          w-full flex items-center justify-center px-4 py-3 rounded-lg
          text-white font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${loading || !email
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
        `}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang gửi...
          </>
        ) : (
          <>
            <Mail className="w-5 h-5 mr-2" />
            Gửi Email Đặt Lại Mật Khẩu
          </>
        )}
      </button>

      {/* Back to Login Link */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          ← Quay lại đăng nhập
        </a>
      </div>
    </form>
  );
}
