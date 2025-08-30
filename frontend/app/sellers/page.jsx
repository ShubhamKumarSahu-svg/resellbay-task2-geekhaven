'use client';

import { AlertCircle, User } from 'lucide-react';
import { useEffect } from 'react';

import { SellerCard } from '@/components/seller/SellerCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';

const SellersGrid = ({ sellers }) => {
  if (sellers.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20">
        <h3 className="text-xl font-semibold">No Sellers Found</h3>
        <p>Check back later to see our growing community of sellers.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sellers.map((seller) => (
        <SellerCard key={seller._id} seller={seller} />
      ))}
    </div>
  );
};

export default function SellersPage() {
  const { sellers, sellersStatus, sellersError, fetchSellers } = useAppStore();

  useEffect(() => {
    if (sellersStatus === STATUS.IDLE) {
      fetchSellers();
    }
  }, [fetchSellers, sellersStatus]);

  const renderContent = () => {
    if (sellersStatus === STATUS.LOADING || sellersStatus === STATUS.IDLE) {
      return <LoadingSpinner text="Loading Sellers..." />;
    }

    if (sellersStatus === STATUS.ERROR) {
      return (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Sellers</AlertTitle>
          <AlertDescription>{sellersError}</AlertDescription>
        </Alert>
      );
    }

    return <SellersGrid sellers={sellers} />;
  };

  return (
    <section>
      <div className="text-center mb-12">
        <User className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight mt-4">Our Sellers</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our community of trusted and verified sellers.
        </p>
      </div>
      {renderContent()}
    </section>
  );
}
