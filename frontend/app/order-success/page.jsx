'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('oid');

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="mt-4 text-3xl">
            Thank You for Your Order!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your purchase has been completed successfully. You can view your
            order details in your profile.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Your Order ID is:
              <span className="rounded bg-muted p-1 font-mono">{orderId}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/order-history"
            className="w-full rounded-md bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="w-full rounded-md border border-input bg-background px-4 py-3 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Continue Shopping
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
