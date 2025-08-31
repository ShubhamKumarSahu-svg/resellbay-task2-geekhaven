'use client';

import { useEffect } from 'react';
import useReviewStore from '../../stores/useReviewStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ReviewCard } from './ReviewCard';

export const ReviewList = ({ type, id }) => {
  const { reviews, status, error, fetchReviews, clearReviews, clearError } =
    useReviewStore();

  useEffect(() => {
    if (id && type) {
      fetchReviews(type, id);
    }
    return () => {
      clearReviews();
    };
  }, [id, type, fetchReviews, clearReviews]);

  if (status === 'loading') {
    return <LoadingSpinner text="Loading reviews..." />;
  }

  if (status === 'error') {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-500 dark:text-red-400">
            {error?.message || 'Could not load reviews.'}
          </p>
          <button
            onClick={() => {
              clearError();
              fetchReviews(type, id);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No reviews have been left yet.</p>
        </div>
      )}
    </div>
  );
};
