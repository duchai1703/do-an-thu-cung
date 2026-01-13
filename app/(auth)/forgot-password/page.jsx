/**
 * Forgot Password Page
 * Allows users to request password reset email
 */
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2 } from 'lucide-react';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import { useNotification } from '@/lib/contexts/NotificationContext';
import { handleError } from '@/lib/utils/error-handler';
import apiClient from '@/lib/utils/api-client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Check if redirected from login with expired token
  const expired = searchParams.get('expired');

  const handleSubmit = async (email) => {
    setLoading(true);
    
    try {
      // Call API to request password reset
      await apiClient.post('/api/auth/forgot-password', { email });
      
      // Success
      setSubmittedEmail(email);
      setIsSubmitted(true);
      success('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 5000);
      
    } catch (err) {
      const errorInfo = handleError(err);
      error(errorInfo.message);
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Email Đã Được Gửi!
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
            </p>
            <p className="text-lg font-semibold text-blue-600 mb-6">
              {submittedEmail}
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Các bước tiếp theo:
              </h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Kiểm tra hộp thư đến của bạn</li>
                <li>Mở email từ PAW LOVERS</li>
                <li>Click vào link đặt lại mật khẩu</li>
                <li>Nhập mật khẩu mới của bạn</li>
              </ol>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 mb-6">
              Không thấy email? Kiểm tra thư mục spam hoặc thư rác.
              <br />
              Link đặt lại mật khẩu có hiệu lực trong 15 phút.
            </p>

            {/* Auto Redirect Notice */}
            <p className="text-sm text-gray-500 mb-4">
              Đang chuyển về trang đăng nhập...
            </p>

            {/* Manual Redirect Button */}
            <button
              onClick={() => router.push('/login')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Quay về Đăng Nhập Ngay
            </button>
          </div>

          {/* Resend Link */}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              Không nhận được email? Gửi lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quên Mật Khẩu?
            </h2>
            <p className="text-gray-600">
              Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
            </p>
          </div>

          {/* Session Expired Warning */}
          {expired === 'true' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Phiên đăng nhập đã hết hạn</p>
                  <p>Vui lòng đặt lại mật khẩu để tiếp tục.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
