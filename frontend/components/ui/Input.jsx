import { cn } from '@/lib/utils';
import * as React from 'react';

const Input = React.forwardRef(
  (
    { className, type, leftIcon: LeftIcon, rightIcon: RightIcon, ...props },
    ref
  ) => {
    return (
      <div className="relative flex h-10 w-full items-center">
        {LeftIcon && (
          <div className="pointer-events-none absolute left-3">
            <LeftIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-full w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            LeftIcon ? 'pl-9' : '',
            RightIcon ? 'pr-9' : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {RightIcon && (
          <div className="pointer-events-none absolute right-3">
            <RightIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
