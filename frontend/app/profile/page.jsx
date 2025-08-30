'use client';

import Link from 'next/link';
import { useState } from 'react';

import { OrderHistoryTab } from '@/components/order/OrderHistoryTab';
import { MyListingsTab } from '@/components/pages/MyListingsTab';
import { LikedItems } from '@/components/profile/LikedItems';
import { ProfileDetailsTab } from '@/components/profile/ProfileDetailsTab';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProfileData } from '@/hooks/useProfileData';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';

export default function ProfilePage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('details');

  const { myListings, orders, status, error } = useProfileData();

  const renderTabContent = () => {
    if (status === STATUS.LOADING) {
      return <LoadingSpinner text="Loading your profile data..." />;
    }

    if (status === STATUS.ERROR) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {error || 'Something went wrong.'}
          </AlertDescription>
        </Alert>
      );
    }

    switch (activeTab) {
      case 'listings':
        return <MyListingsTab listings={myListings} />;
      case 'orders':
        return <OrderHistoryTab orders={orders} />;
      case 'liked':
        return <LikedItems userId={user._id} />;
      case 'details':
      default:
        return <ProfileDetailsTab />;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Please
          <Link href="/login" className="text-primary underline">
            {' '}
            log in{' '}
          </Link>
          to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="flex-1">{renderTabContent()}</main>
      </div>
    </div>
  );
}
