'use client';

import { Frown } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import CartItemsList from '@/components/cart/CardItemsList';
import { CheckoutModal } from '@/components/order/CheckoutModal';
import EmptyCart from '@/components/cart/EmptyCart';
import OrderSummary from '@/components/order/OrderSummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useCartStore from '@/stores/useCartStore';

export default function CartPage() {
  const user = useAppStore((state) => state.user);
  const {
    cart,
    summary,
    status,
    error,
    fetchCart,
    updateCartItem,
    removeCartItem,
  } = useCartStore();
  const [isCheckoutVisible, setCheckoutVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const handleUpdate = useCallback(
    async (productId, quantity) => {
      const result = await updateCartItem(productId, quantity);
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.error?.message || 'Could not update item.',
        });
      }
    },
    [updateCartItem, toast]
  );

  const handleRemove = useCallback(
    async (productId) => {
      const result = await removeCartItem(productId);
      if (result.success) {
        toast({
          title: 'Item Removed',
          description: 'Item removed from cart.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Removal Failed',
          description: result.error?.message || 'Could not remove item.',
        });
      }
    },
    [removeCartItem, toast]
  );

  if (!user) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground text-lg">
          Please{' '}
          <Link href="/login" className="font-semibold underline accent-text">
            log in
          </Link>{' '}
          to view your cart.
        </p>
      </div>
    );
  }

  if (status === STATUS.LOADING && !cart) {
    return <LoadingSpinner text="Loading your cart..." />;
  }

  if (status === STATUS.ERROR && error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Alert variant="destructive" className="max-w-md shadow-md">
          <Frown className="h-5 w-5" />
          <AlertTitle>Could Not Load Cart</AlertTitle>
          <AlertDescription>
            {error.message || 'Something went wrong. Please refresh.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!cart || cart.items.length === 0 || !summary) {
    return <EmptyCart />;
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Shopping Cart ({summary.totalItems}{' '}
              {summary.totalItems === 1 ? 'item' : 'items'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CartItemsList
              cart={cart}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              isUpdating={status === STATUS.LOADING}
            />
          </CardContent>
        </Card>

        <OrderSummary
          summary={summary}
          onCheckout={() => setCheckoutVisible(true)}
          isUpdating={status === STATUS.LOADING}
        />
      </div>

      <CheckoutModal
        isVisible={isCheckoutVisible}
        onClose={() => setCheckoutVisible(false)}
      />
    </>
  );
}
