'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import useAppStore from '@/stores/useAppStore';
import useProductStore from '@/stores/useProductStore';

const ProductCard = ({ product, onLikeToggle }) => {
  const { toggleLike } = useProductStore();
  const { user } = useAppStore();

  if (!product) return null;

  const imageUrl =
    product.images?.[0] ||
    'https://placehold.co/600x400/EEE/31343C?text=No+Image';

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      console.log('User must be logged in to like products');
      return;
    }

    const result = await toggleLike(product._id);

    if (onLikeToggle && !result.product.likedByUser) {
      onLikeToggle(product._id);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={product.title || 'Product Image'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 text-gray-700 backdrop-blur-sm transition hover:bg-white"
          aria-label="Like product"
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all',
              product.likedByUser
                ? 'text-red-500 fill-red-500'
                : 'text-gray-500'
            )}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
          <Link
            href={`/products/${product._id}`}
            className="transition-colors hover:accent-text"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {product.title || 'Untitled Product'}
          </Link>
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            By {product.seller?.name || 'Unknown'}
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Heart className="h-4 w-4" />
            <span>{product.likesCount}</span>
          </div>
        </div>

        <p className="mt-4 text-xl font-bold accent-text">
          ${product.price?.toFixed(2) || '0.00'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
