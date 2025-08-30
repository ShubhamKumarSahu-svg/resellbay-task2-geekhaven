'use client';

import { CreditCard, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useCartStore from '@/stores/useCartStore';

const ShippingForm = ({ user, onSubmit, isSubmitting }) => {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    ...user?.address,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6" />
          <CardTitle className="text-2xl">Shipping Information</CardTitle>
        </div>
        <p className="text-muted-foreground pt-1">
          Enter the address where you'd like to receive your order.
        </p>
      </CardHeader>
      <CardContent>
        <form id="shipping-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              value={address.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={address.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                name="state"
                value={address.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP / Postal Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={address.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const CheckoutSummary = ({ cart, summary }) => (
  <Card className="h-fit sticky top-20">
    <CardHeader>
      <CardTitle className="text-xl flex items-center gap-3">
        <ShoppingBag className="h-5 w-5" />
        Order Summary
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4 mb-6 border-b pb-4">
        {cart?.items?.map((item) => (
          <div key={item.product._id} className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={item.product.images[0] || 'https://placehold.co/64x64'}
                alt={item.product.title}
                fill
                className="rounded-md object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-grow">
              <p className="font-semibold">{item.product.title}</p>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-semibold">
              ${(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-2 text-muted-foreground">
        <div className="flex justify-between">
          <p>Subtotal:</p>
          <p>${summary.totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Platform Fee:</p>
          <p>${summary.platformFee.toFixed(2)}</p>
        </div>
        <div className="border-t my-2"></div>
        <div className="flex justify-between font-bold text-lg text-foreground">
          <p>Total:</p>
          <p>${summary.finalTotal.toFixed(2)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthInitialized } = useAppStore();
  const { cart, summary, status, fetchCart, checkout } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthInitialized) return;

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to check out.',
        variant: 'destructive',
      });
      router.replace('/login');
      return;
    }

    fetchCart();
  }, [user, isAuthInitialized, fetchCart, router, toast]);

  useEffect(() => {
    if (status === STATUS.SUCCESS && (!cart || cart.items.length === 0)) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add items before checking out.',
        variant: 'destructive',
      });
      router.replace('/cart');
    }
  }, [cart, status, router, toast]);

  const handleCheckout = async (shippingAddress) => {
    setIsSubmitting(true);
    const result = await checkout(shippingAddress);

    if (result.success) {
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed.',
      });
      router.push(`/order-success?oid=${result.order._id}`);
    } else {
      toast({
        title: 'Checkout Failed',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (!isAuthInitialized || status === STATUS.LOADING) {
    return <LoadingSpinner text="Loading checkout..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Redirecting to your cart...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto items-start">
      <div className="lg:col-span-3">
        <ShippingForm
          user={user}
          onSubmit={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="lg:col-span-2">
        <CheckoutSummary cart={cart} summary={summary} />
        <Button
          type="submit"
          form="shipping-form"
          loading={isSubmitting}
          className="w-full mt-6 text-lg"
          size="lg"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {isSubmitting
            ? 'Processing Order...'
            : `Place Order - $${summary.finalTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
