'use client';

import { MessageSquare, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAppStore from '../../stores/useAppStore';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { StarRating } from '../ui/custom/StarRating';

export const SellerCard = ({ seller }) => {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  const handleMessageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/messages?chatWith=${seller._id}`);
  };

  return (
    <Link href={`/sellers/${seller._id}`} className="block group h-full">
      <Card className="group-hover:shadow-lg group-hover:border-indigo-500/50 transition-all duration-200 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={seller.profileImage} alt={seller.name} />
            <AvatarFallback>
              {seller.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{seller.name}</CardTitle>
            <StarRating
              rating={seller.rating?.average}
              count={seller.rating?.count}
              className="mt-1"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based in {seller.address?.city ?? 'Location not specified'}
          </p>
        </CardContent>

        {user && user._id !== seller._id && (
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="w-full">
              <UserIcon className="mr-2 h-4 w-4" />
              View Profile & Reviews
            </Button>
            <Button className="w-full accent-bg" onClick={handleMessageClick}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};
