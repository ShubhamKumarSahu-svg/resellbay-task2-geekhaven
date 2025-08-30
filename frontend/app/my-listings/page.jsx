'use client';

import { Edit, Filter, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/custom/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useProductStore from '@/stores/useProductStore';

export default function MyListingsPage() {
  const {
    products = [],
    status,
    fetchProducts,
    deleteProduct,
    filters,
    setFilters,
    clearFilters,
  } = useProductStore();

  const { toast } = useToast();
  const [isDeletingId, setIsDeletingId] = useState(null);

  useEffect(() => {
    setFilters({ search: '', isMyListing: true });
    fetchProducts(1, { isMyListing: true });
    return () => clearFilters();
  }, [setFilters, clearFilters, fetchProducts]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters({ search: value, isMyListing: true });
    fetchProducts(1, { search: value, isMyListing: true });
  };

  const handleDeleteProduct = async (productId) => {
    setIsDeletingId(productId);
    const result = await deleteProduct(productId);
    setIsDeletingId(null);

    toast(
      result.success
        ? {
            title: 'Success',
            description: 'Product deleted successfully.',
          }
        : {
            variant: 'destructive',
            title: 'Error',
            description: result.error?.message || 'Failed to delete product.',
          }
    );
  };

  if (status === STATUS.LOADING && !products.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/add-product">
          <Button>
            <Plus size={16} className="mr-2" />
            Add New Listing
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search your listings..."
          value={filters.search || ''}
          onChange={handleSearchChange}
        />
        <Button variant="outline" disabled>
          <Filter size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No listings found"
          description={
            filters.search
              ? 'No listings match your search.'
              : "You haven't created any listings yet."
          }
          action={
            !filters.search && (
              <Link href="/add-product">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Create Listing
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="flex flex-col gap-2">
              <ProductCard product={product} />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDeleteProduct(product._id)}
                  disabled={isDeletingId === product._id}
                >
                  <Trash2 size={16} className="mr-2" />
                  {isDeletingId === product._id ? 'Deleting...' : 'Delete'}
                </Button>
                <Link href={`/edit-product/${product._id}`} className="w-full">
                  <Button variant="secondary" className="w-full">
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
