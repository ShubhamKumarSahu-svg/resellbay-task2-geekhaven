'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/useToast';
import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useCartStore from '@/stores/useCartStore';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export const CheckoutModal = ({ isVisible, onClose }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { checkout, summary, status } = useCartStore();
  const { user } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'India',
    },
  });

  const onSubmit = async (data) => {
    const shippingAddress = {
      street: data.street,
      city: data.city,
      zipCode: data.zipCode,
      country: data.country,
      state: data.state,
    };

    const result = await checkout(shippingAddress);

    if (result.success && result.order?.id) {
      toast({
        title: 'Order Successful!',
        description: 'Your order has been placed.',
      });
      router.push(`/order-success?oid=${result.order.id}`);
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'Checkout Failed',
        description: result.error?.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Shipping Information</DialogTitle>
          <DialogDescription>
            Confirm your address to complete the purchase. All fields are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                className="mt-1"
                {...register('street', { required: 'Street is required' })}
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                className="mt-1"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  className="mt-1"
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  className="mt-1"
                  {...register('zipCode', { required: 'Zip code is required' })}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                className="mt-1"
                {...register('country', { required: 'Country is required' })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || status === STATUS.LOADING}
              className="w-full"
            >
              {isSubmitting
                ? 'Placing Order...'
                : `Pay ₹${summary.finalTotal.toFixed(2)} (COD)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
