/**
 * Test Page - Testing foundation components
 * Route: /test-foundation
 */
'use client';

import { useState } from 'react';
import { useNotification } from '@/lib/contexts/NotificationContext';
import Modal, { ConfirmModal, AlertModal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/utils/api-client';

export default function TestFoundationPage() {
  const { success, error, warning, info } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [apiTestResult, setApiTestResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Test Toast Notifications
  const testToasts = () => {
    setTimeout(() => success('✅ Success notification test!'), 0);
    setTimeout(() => error('❌ Error notification test!'), 500);
    setTimeout(() => warning('⚠️ Warning notification test!'), 1000);
    setTimeout(() => info('ℹ️ Info notification test!'), 1500);
  };

  // Test API Client
  const testAPI = async () => {
    setApiLoading(true);
    setApiTestResult(null);

    try {
      const response = await apiClient.get('/api/health');
      setApiTestResult({
        success: true,
        data: response,
        message: 'API connection successful!',
      });
      success('API test thành công!');
    } catch (err) {
      setApiTestResult({
        success: false,
        error: err.message,
        status: err.status,
      });
      error(`API test thất bại: ${err.message}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Test Modal Actions
  const handleConfirm = () => {
    success('Bạn đã xác nhận!');
    setShowConfirmModal(false);
  };

  const showAlert = (type) => {
    setAlertType(type);
    setShowAlertModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Foundation Components Test
          </h1>
          <p className="text-gray-600">
            Testing Phase 1: API Client, Toast Notifications, Modal Components
          </p>
        </div>

        {/* Test Sections */}
        <div className="space-y-8">
          {/* Toast Notifications Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Toast Notifications
            </h2>
            <p className="text-gray-600 mb-4">
              Test all notification types: success, error, warning, info
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => success('Thành công!')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Test Success
              </button>
              <button
                onClick={() => error('Lỗi rồi!')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Test Error
              </button>
              <button
                onClick={() => warning('Cảnh báo!')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Test Warning
              </button>
              <button
                onClick={() => info('Thông tin!')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Test Info
              </button>
              <button
                onClick={testToasts}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Test All (Sequence)
              </button>
            </div>
          </div>

          {/* Modal Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Modal Components
            </h2>
            <p className="text-gray-600 mb-4">
              Test basic modal, confirm modal, and alert modal
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open Basic Modal
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Open Confirm Modal
              </button>
              <button
                onClick={() => showAlert('success')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Success Alert
              </button>
              <button
                onClick={() => showAlert('error')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Error Alert
              </button>
            </div>
          </div>

          {/* API Client Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. API Client
            </h2>
            <p className="text-gray-600 mb-4">
              Test API connection to backend (http://localhost:3001)
            </p>
            <div className="space-y-4">
              <button
                onClick={testAPI}
                disabled={apiLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {apiLoading ? 'Testing...' : 'Test API Connection'}
              </button>

              {apiTestResult && (
                <div
                  className={`p-4 rounded-lg ${
                    apiTestResult.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <h3
                    className={`font-semibold mb-2 ${
                      apiTestResult.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {apiTestResult.success ? '✅ Success' : '❌ Failed'}
                  </h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(apiTestResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Đảm bảo backend đang chạy tại{' '}
                  <code className="bg-yellow-100 px-2 py-1 rounded">
                    http://localhost:3001
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Component Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              ✅ Phase 1 Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>API Client (lib/utils/api-client.js)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Error Handler (lib/utils/error-handler.js)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Notification Context (lib/contexts/NotificationContext.jsx)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Toast Component (components/ui/Toast.jsx)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Modal Component (components/ui/Modal.jsx)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Environment Variables (.env.example)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>NotificationProvider integrated in layout.js</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Basic Modal Example"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                success('Modal action triggered!');
                setShowModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xác nhận
            </button>
          </div>
        }
      >
        <p className="text-gray-600">
          Đây là một basic modal với header, body, và footer có thể tùy chỉnh.
        </p>
        <p className="text-gray-600 mt-2">
          Modal này support:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
          <li>Close on overlay click</li>
          <li>Close on ESC key</li>
          <li>Focus trap</li>
          <li>Prevent body scroll</li>
          <li>Multiple sizes (sm, md, lg, xl, full)</li>
        </ul>
      </Modal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        title="Xác nhận hành động"
        message="Bạn có chắc chắn muốn thực hiện hành động này không?"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        type={alertType}
        title={
          alertType === 'success'
            ? 'Thành công!'
            : alertType === 'error'
            ? 'Lỗi!'
            : alertType === 'warning'
            ? 'Cảnh báo!'
            : 'Thông báo'
        }
        message={
          alertType === 'success'
            ? 'Hành động đã được thực hiện thành công!'
            : alertType === 'error'
            ? 'Đã xảy ra lỗi khi thực hiện hành động.'
            : alertType === 'warning'
            ? 'Vui lòng kiểm tra lại thông tin trước khi tiếp tục.'
            : 'Đây là một thông báo quan trọng.'
        }
      />
    </div>
  );
}
