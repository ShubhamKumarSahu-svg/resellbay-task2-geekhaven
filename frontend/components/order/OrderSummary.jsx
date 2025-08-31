'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function OrderSummary({ summary, onCheckout, isUpdating }) {
  return (
    <Card className="sticky top-20 h-fit shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex justify-between">
            <p>Subtotal ({summary.totalItems} items):</p>
            <p className="font-medium">${summary.totalPrice.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p>Platform Fee:</p>
            <p className="font-medium">${summary.platformFee.toFixed(2)}</p>
          </div>
          <div className="my-3 border-t border-border"></div>
          <div className="flex justify-between text-lg font-bold text-foreground">
            <p>Total:</p>
            <p>${summary.finalTotal.toFixed(2)}</p>
          </div>
        </div>
        <Button
          onClick={onCheckout}
          className="mt-6 w-full text-lg font-bold"
          size="lg"
          disabled={isUpdating || summary.totalItems === 0}
        >
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
}
