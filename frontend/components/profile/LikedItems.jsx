'use client';

import { Heart } from 'lucide-react';
import { useEffect } from 'react';

import ProductCard from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { STATUS } from '@/lib/constants';
import useProductStore from '@/stores/useProductStore';

export const LikedItems = ({ userId }) => {
  const { likedProducts, likedStatus, fetchLikedProducts } = useProductStore();

  useEffect(() => {
    if (userId) {
      fetchLikedProducts();
    }
  }, [userId, fetchLikedProducts]);

  if (likedStatus === STATUS.LOADING) {
    return <LoadingSpinner text="Loading liked items..." />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Liked Items</h2>
      {likedProducts && likedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border rounded-lg p-12 h-64">
          <Heart size={48} className="mb-4" />
          <h3 className="text-xl font-semibold">No Liked Items Yet</h3>
          <p className="mt-2 text-sm">
            Browse products and click the heart icon to save them here.
          </p>
        </div>
      )}
    </div>
  );
};
