'use client';

import { STATUS } from '@/lib/constants';
import useProductStore from '@/stores/useProductStore';
import { useEffect } from 'react';

import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search } from 'lucide-react';

export default function HomePage() {
  const { products, status, error, fetchProducts, setFilters } =
    useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setFilters({ search: searchTerm });
    fetchProducts(1);
  };

  const renderContent = () => {
    if (status === STATUS.LOADING) {
      return <LoadingSpinner text="Finding treasures..." />;
    }

    if (status === STATUS.ERROR) {
      return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>{error.title || 'Failed to Load Products'}</AlertTitle>
          <AlertDescription>{error.description}</AlertDescription>
        </Alert>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10">
          <h3 className="text-xl font-semibold">No Products Found</h3>
          <p>Try adjusting your search or check back later.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <section>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find Your Next Treasure
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The best place to buy and sell unique pre-loved items.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 flex max-w-2xl mx-auto">
        <Input
          type="search"
          name="search"
          placeholder="Search for electronics, clothing, and more..."
          className="rounded-r-none h-12 text-base"
        />
        <Button type="submit" size="lg" className="rounded-l-none">
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </form>

      {renderContent()}
    </section>
  );
}
