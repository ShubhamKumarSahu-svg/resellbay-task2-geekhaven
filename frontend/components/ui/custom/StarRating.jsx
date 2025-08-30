'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  count,
  className,
  starClassName = 'h-5 w-5',
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          const fillPercentage =
            ratingValue <= rating
              ? '100%'
              : ratingValue - 0.5 <= rating
              ? '50%'
              : '0%';

          return (
            <div key={i} className="relative">
              <Star
                className={cn(
                  'text-gray-300 dark:text-gray-600',
                  starClassName
                )}
              />
              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: fillPercentage }}
              >
                <Star
                  className={cn('text-yellow-400 fill-current', starClassName)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {typeof count !== 'undefined' && (
        <span className="text-sm text-muted-foreground">
          ({count} review{count !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};
