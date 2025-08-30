'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import useAppStore from '@/stores/useAppStore';
import { useEffect } from 'react';

const ClientProviders = ({ children }) => {
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const isAuthInitialized = useAppStore((state) => state.isAuthInitialized);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isAuthInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

  return children;
};

export default ClientProviders;
