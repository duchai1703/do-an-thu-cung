"use client";
import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle2;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'error': return 'bg-red-100 text-red-800 border border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.type);
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-center gap-2 p-4 rounded-lg shadow-lg max-w-md animate-in slide-in-from-bottom-4",
                getToastStyles(toast.type)
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="hover:opacity-70 transition-opacity"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
