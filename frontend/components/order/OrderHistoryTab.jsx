'use client';

import OrderCard from '@/components/order/OrderCard';
import ReviewModal from '@/components/review/ReviewModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useCallback, useState } from 'react';

export const OrderHistoryTab = ({ orders, onReviewSubmitted }) => {
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    target: null,
    type: null,
  });

  const handleOpenReviewModal = useCallback((target, type) => {
    setReviewModal({ isOpen: true, target, type });
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewModal({ isOpen: false, target: null, type: null });
  }, []);

  const handleReviewSuccess = useCallback(() => {
    handleCloseReviewModal();
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  }, [handleCloseReviewModal, onReviewSubmitted]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Recent Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onReviewClick={handleOpenReviewModal}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You have not placed any orders yet.
            </p>
          )}
        </CardContent>
      </Card>

      {reviewModal.target && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={handleCloseReviewModal}
          target={reviewModal.target}
          type={reviewModal.type}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
};
