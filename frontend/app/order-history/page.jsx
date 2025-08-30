'use client';

import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import OrderCard from '@/components/order/OrderCard';
import { AppPagination } from '@/components/product/AppPagination';
import ReviewModal from '@/components/review/ReviewModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useOrderStore from '@/stores/useOrderStore';

const EmptyState = () => (
  <Card className="text-center py-16">
    <CardContent>
      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">No Orders Yet</h3>
      <p className="mt-1 text-muted-foreground">
        When you place an order, it will appear here.
      </p>
    </CardContent>
  </Card>
);

const OrderList = ({ orders, onReviewClick }) => (
  <div className="space-y-6">
    {orders.map((order) => (
      <OrderCard key={order._id} order={order} onReviewClick={onReviewClick} />
    ))}
  </div>
);

export default function OrderHistoryPage() {
  const { orders, pagination, status, error, fetchOrderHistory } =
    useOrderStore();
  const { token, isAuthInitialized } = useAppStore();
  const router = useRouter();
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    target: null,
    type: null,
  });

  useEffect(() => {
    if (isAuthInitialized && !token) {
      router.push('/login');
      return;
    }

    if (token && isAuthInitialized) {
      fetchOrderHistory(1);
    }
  }, [token, isAuthInitialized, fetchOrderHistory, router]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchOrderHistory(newPage);
    },
    [fetchOrderHistory]
  );

  const handleOpenReviewModal = useCallback((target, type) => {
    setReviewModal({ isOpen: true, target, type });
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewModal({ isOpen: false, target: null, type: null });
  }, []);

  const handleReviewSubmitted = useCallback(() => {
    handleCloseReviewModal();
    fetchOrderHistory(pagination.page);
  }, [fetchOrderHistory, pagination.page, handleCloseReviewModal]);

  if (!isAuthInitialized) {
    return <LoadingSpinner text="Initializing..." />;
  }

  if (!token) {
    return <LoadingSpinner text="Redirecting to login..." />;
  }

  const renderContent = () => {
    if (status === STATUS.LOADING && !orders.length) {
      return <LoadingSpinner text="Loading your order history..." />;
    }

    if (status === STATUS.ERROR) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error Loading Orders</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (orders.length === 0) {
      return <EmptyState />;
    }

    return <OrderList orders={orders} onReviewClick={handleOpenReviewModal} />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      {renderContent()}

      {orders.length > 0 && pagination.totalPages > 1 && (
        <AppPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {reviewModal.target && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={handleCloseReviewModal}
          target={reviewModal.target}
          type={reviewModal.type}
          onSuccess={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
