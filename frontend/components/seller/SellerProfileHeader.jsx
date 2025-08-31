'use client';

import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { StarRating } from '../ui/custom/StarRating';

export const SellerProfileHeader = ({ seller, currentUser }) => {
  if (!seller) return null;

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Image
            src={
              seller.profileImage || `https://i.pravatar.cc/150?u=${seller._id}`
            }
            alt={seller.name}
            width={96}
            height={96}
            sizes="96px"
            className="w-24 h-24 rounded-full shadow-md object-cover border-4 border-border"
            priority
          />

          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold break-words">
              {seller.name}
            </h1>
            <StarRating
              rating={seller.rating?.average}
              count={seller.rating?.count}
              className="mt-2 justify-center sm:justify-start"
            />
          </div>

          {currentUser && currentUser._id !== seller._id && (
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/messages?chatWith=${seller._id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Seller
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
