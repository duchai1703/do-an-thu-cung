/**
 * Notification Context - Global state management for toast notifications
 * Provides methods to show success, error, warning, and info messages
 */
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '@/components/ui/Toast';

const NotificationContext = createContext(undefined);

let nextId = 0;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a notification toast
   * @param {string} message - Message to display
   * @param {string} type - Type of notification (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds (default: 5000)
   */
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = nextId++;
    
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        duration,
      },
    ]);

    // Auto remove after duration + animation time
    setTimeout(() => {
      removeNotification(id);
    }, duration + 500);
  }, []);

  /**
   * Remove a notification by ID
   * @param {number} id - Notification ID
   */
  const removeNotification = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {number} duration - Duration in milliseconds
   */
  const success = useCallback((message, duration) => {
    addNotification(message, 'success', duration);
  }, [addNotification]);

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in milliseconds
   */
  const error = useCallback((message, duration) => {
    addNotification(message, 'error', duration);
  }, [addNotification]);

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {number} duration - Duration in milliseconds
   */
  const warning = useCallback((message, duration) => {
    addNotification(message, 'warning', duration);
  }, [addNotification]);

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {number} duration - Duration in milliseconds
   */
  const info = useCallback((message, duration) => {
    addNotification(message, 'info', duration);
  }, [addNotification]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    success,
    error,
    warning,
    info,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 * @returns {Object} Notification methods
 * @throws {Error} If used outside NotificationProvider
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

export default NotificationContext;
