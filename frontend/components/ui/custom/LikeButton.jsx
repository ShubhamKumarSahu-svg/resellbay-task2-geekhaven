'use client';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import useAppStore from '@/stores/useAppStore';
import useProductStore from '@/stores/useProductStore';
import { Heart } from 'lucide-react';
import { useMemo, useState } from 'react';

export const LikeButton = ({ productId }) => {
  const { user } = useAppStore();
  const { products, toggleLike } = useProductStore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Memoize product lookup for performance
  const product = useMemo(
    () => products.find((p) => p._id === productId),
    [products, productId]
  );

  const isLiked = product?.likedByUser ?? false;
  const likesCount = product?.likesCount ?? 0;

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to like products.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await toggleLike(productId);

      // If backend returned updated product, sync instantly
      if (result?.product) {
        toast({
          title: isLiked ? 'Removed Like' : 'Added Like',
          description: `Total likes: ${result.product.likesCount}`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update like.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLikeClick}
      disabled={isLoading}
      variant={isLiked ? 'destructive' : 'outline'}
      className="w-full flex items-center justify-center"
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={cn(
          'mr-2 h-5 w-5 transition-colors',
          isLiked ? 'fill-current text-red-500' : 'text-gray-600'
        )}
      />
      <span>{likesCount}</span>
    </Button>
  );
};
