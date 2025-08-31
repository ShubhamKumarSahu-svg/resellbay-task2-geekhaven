import Image from 'next/image';
import { StarRating } from '../ui/custom/StarRating';

export const ReviewCard = ({ review }) => {
  if (!review?.reviewer) return null;

  const { reviewer, rating, createdAt, comment } = review;
  const reviewerName = reviewer.name || 'Anonymous';
  const profileImageUrl =
    reviewer.profileImage || `https://i.pravatar.cc/150?u=${reviewer._id}`;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex items-start gap-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src={profileImageUrl}
            alt={reviewerName}
            fill
            sizes="48px"
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg">{reviewerName}</p>
          <StarRating rating={rating} />
        </div>
        <p className="flex-shrink-0 text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
      {comment && (
        <p className="italic text-gray-700 dark:text-gray-300">"{comment}"</p>
      )}
    </div>
  );
};
