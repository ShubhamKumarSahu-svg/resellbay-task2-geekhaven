'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({
  size = 'md',
  color = 'text-blue-600',
  text,
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6',
        className
      )}
    >
      <Loader2
        className={cn('animate-spin', sizeClasses[size], color)}
        aria-label="Loading"
      />
      {text && <p className="text-gray-600 dark:text-gray-300">{text}</p>}
    </div>
  );
};
