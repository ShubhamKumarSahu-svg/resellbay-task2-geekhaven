'use client';

import { AlertCircle } from 'lucide-react';

import { ReviewList } from '@/components/review/ReviewList';
import { SellerListings } from '@/components/seller/SellerListings';
import { SellerProfileHeader } from '@/components/seller/SellerProfileHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useSellerProfile } from '@/hooks/useSellerProfile';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';

export default function SellerProfilePage({ params }) {
  const { id } = params;
  const { user } = useAppStore();

  const { seller, listings, status, error } = useSellerProfile(id);

  const renderContent = () => {
    if (status === STATUS.LOADING || status === STATUS.IDLE) {
      return <LoadingSpinner text="Loading seller profile..." />;
    }

    if (status === STATUS.ERROR || !seller) {
      return (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could Not Load Profile</AlertTitle>
          <AlertDescription>
            {error || 'The seller you are looking for does not exist.'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        <SellerProfileHeader seller={seller} currentUser={user} />
        <SellerListings listings={listings} sellerName={seller.name} />
        <ReviewList type="user" id={id} />
      </>
    );
  };

  return <div className="space-y-8">{renderContent()}</div>;
}
