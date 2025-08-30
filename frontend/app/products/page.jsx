'use client';

import { useEffect } from 'react';

import { AppPagination } from '@/components/product/AppPagination';
import ProductCard from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { STATUS } from '@/lib/constants';
import useProductStore from '@/stores/useProductStore';

const ProductGrid = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 col-span-full">
        <h3 className="text-xl font-semibold">No Products Found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default function AllProductsPage() {
  const { products, pagination, status, error, fetchProducts, filters } =
    useProductStore();

  useEffect(() => {
    fetchProducts(1);
  }, [filters, fetchProducts]);

  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
  };

  const renderContent = () => {
    if (status === STATUS.LOADING && products.length === 0) {
      return <LoadingSpinner text="Fetching products..." />;
    }

    if (status === STATUS.ERROR) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error Loading Products</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return <ProductGrid products={products} />;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <ProductFilters />

      <div className="mt-8">{renderContent()}</div>

      <AppPagination pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
}
