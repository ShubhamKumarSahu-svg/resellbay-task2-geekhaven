'use client';

import Toaster from '@/components/ui/Toaster'; // The visual component for a single toast
import { AnimatePresence } from 'framer-motion';
import * as React from 'react';

export const ToastContext = React.createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const removeToast = React.useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toastData) => {
      const id = Date.now() + Math.random();

      const toastInfo = {
        title: toastData.title || 'Notification',
        description: toastData.description || '',
        type: toastData.variant === 'destructive' ? 'error' : 'success',
      };

      setToasts((prev) => [...prev, { id, ...toastInfo }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const value = React.useMemo(() => ({ toast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end justify-end p-4 sm:p-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toaster
              key={toast.id}
              {...toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
