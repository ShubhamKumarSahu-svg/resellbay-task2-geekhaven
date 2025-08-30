'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

export const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
        className={cn(
          'h-4 w-4 rounded border border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1',
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
