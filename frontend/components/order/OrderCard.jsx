'use client';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/Card';
import { Star } from 'lucide-react';
import Image from 'next/image';

export default function OrderCard({ order, onReviewClick }) {
  const primarySeller = order.items?.[0]?.seller;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between bg-muted/50 p-4">
        <div>
          <p className="text-sm font-semibold">ORDER PLACED</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-right">TOTAL</p>
          <p className="text-xs text-muted-foreground text-right">
            ${order.total.toFixed(2)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {order.items.map((item) => (
          <div key={item.product._id} className="flex gap-4">
            <Image
              src={item.product.images?.[0] || 'https://placehold.co/100x100'}
              alt={item.product.title}
              width={80}
              height={80}
              className="rounded-md object-cover border"
            />
            <div className="flex-grow">
              <p className="font-semibold">{item.product.title}</p>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            {!item.isReviewed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onReviewClick(
                    {
                      orderId: order._id,
                      productId: item.product._id,
                      productTitle: item.product.title,
                    },
                    'product'
                  )
                }
              >
                <Star size={14} className="mr-2" />
                Review Product
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      {primarySeller && (
        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Sold by:{' '}
            <span className="font-semibold text-foreground">
              {primarySeller.name}
            </span>
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onReviewClick(
                {
                  orderId: order._id,
                  sellerId: primarySeller._id,
                  name: primarySeller.name,
                },
                'seller'
              )
            }
          >
            Review Seller
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
