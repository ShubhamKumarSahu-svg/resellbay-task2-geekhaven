'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/Label';
//recommit
import { Textarea } from '@/components/ui/Textarea';

import { useToast } from '@/hooks/useToast';
import useAppStore from '@/stores/useAppStore';
import useReviewStore from '@/stores/useReviewStore';

const StarRatingInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const stars = Array(5).fill(0);

  return (
    <div className="flex items-center gap-1">
      {stars.map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            onClick={() => onChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer"
          >
            <Star
              size={28}
              className={`transition-colors ${
                ratingValue <= (hover || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default function ReviewModal({
  isOpen,
  onClose,
  target,
  type,
  onSuccess,
}) {
  const { createReview } = useReviewStore();
  const { user } = useAppStore(); // Get current user
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { rating: 0, comment: '' },
  });

  const isProductReview = type === 'product';
  const title = isProductReview
    ? `Reviewing: ${target.productTitle}`
    : `Reviewing Seller: ${target.name}`;
  const description = isProductReview
    ? 'Share your thoughts on this product.'
    : 'How was your experience with this seller?';

  const isSelfReview = () => {
    if (!user || !target) return false;

    if (type === 'product') {
      // Check if user is the seller of this product
      return user._id === target.sellerId;
    } else {
      // Check if user is the seller being reviewed
      return user._id === target.sellerId;
    }
  };

  const onSubmit = async (data) => {
    // Prevent self-review
    if (isSelfReview()) {
      toast({
        variant: 'destructive',
        title: 'Cannot Review Yourself',
        description:
          type === 'product'
            ? 'You cannot review your own product.'
            : 'You cannot review yourself.',
      });
      return;
    }

    const reviewDetails = {
      orderId: target.orderId,
      targetId: type === 'product' ? target.productId : target.sellerId,
      type: type,
      rating: data.rating,
      comment: data.comment,
    };

    const result = await createReview(reviewDetails);

    if (result.success) {
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      reset();
      onSuccess(result.data.review);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.error?.message || 'Could not submit your review.',
      });
    }
  };

  if (!target) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Your Rating</Label>
            <Controller
              name="rating"
              control={control}
              rules={{ required: true, min: 1 }}
              render={({ field }) => (
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.rating && (
              <p className="text-sm text-red-500 mt-1">
                A rating of at least one star is required.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="comment">Your Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              {...register('comment')}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSelfReview()}
              title={
                isSelfReview()
                  ? type === 'product'
                    ? 'You cannot review your own product'
                    : 'You cannot review yourself'
                  : ''
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
